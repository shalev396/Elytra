import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ACCOUNT_PHOTO_MAX_BYTES, UPLOAD_PURPOSES } from '../constants/uploadLimits.js';
import {
  StagedUploadError,
  assertContentMatchesType,
  consumeStagedUpload,
  createStagedUpload,
  extensionFor,
  limitsForPurpose,
  normalizeFileName,
  stagedUploadErrorStatus,
  validateMimeType,
} from './stagedUpload.js';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]);
const GIF = Buffer.from('GIF89a\x01\x00\x01\x00', 'latin1');
const WEBP = Buffer.from('RIFF\x04\x00\x00\x00WEBPVP8 ', 'latin1');

function statusOf(fn: () => unknown): number | null {
  try {
    fn();
    return null;
  } catch (error) {
    return stagedUploadErrorStatus(error, -1);
  }
}

describe('limitsForPurpose', () => {
  it('returns the account-photo limits', () => {
    const limits = limitsForPurpose('account-photo');
    assert.equal(limits.maxBytes, ACCOUNT_PHOTO_MAX_BYTES);
    assert.equal(limits.maxBytes, 5 * 1024 * 1024);
    assert.deepEqual([...limits.mimeTypes], ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
  });

  it('rejects unknown purposes with 400, including prototype keys', () => {
    for (const purpose of ['avatar', '', undefined, 42, 'toString', '__proto__']) {
      assert.equal(
        statusOf(() => limitsForPurpose(purpose)),
        400,
        String(purpose),
      );
    }
  });
});

describe('validateMimeType', () => {
  const limits = UPLOAD_PURPOSES['account-photo'];

  it('accepts allowed types, normalizing case and parameters', () => {
    assert.equal(validateMimeType('image/png', limits), 'image/png');
    assert.equal(validateMimeType('Image/JPEG; charset=binary', limits), 'image/jpeg');
  });

  it('rejects SVG, PDF, HTML and missing types with 400', () => {
    for (const type of ['image/svg+xml', 'application/pdf', 'text/html', '', undefined, 7]) {
      assert.equal(
        statusOf(() => validateMimeType(type, limits)),
        400,
        String(type),
      );
    }
  });
});

describe('normalizeFileName', () => {
  it('keeps a name whose extension matches the type', () => {
    assert.equal(normalizeFileName('me.png', 'image/png'), 'me.png');
    assert.equal(normalizeFileName(' Photo.JPEG ', 'image/jpeg'), 'Photo.JPEG');
  });

  it('appends the canonical extension when it does not match', () => {
    assert.equal(normalizeFileName('page.html', 'image/png'), 'page.html.png');
    assert.equal(normalizeFileName('noext', 'image/webp'), 'noext.webp');
  });

  it('strips directories from the name', () => {
    assert.equal(normalizeFileName('../../etc/me.gif', 'image/gif'), 'me.gif');
    assert.equal(normalizeFileName('C:\\Users\\me\\me.gif', 'image/gif'), 'me.gif');
  });

  it('rejects missing, empty and oversized names with 400', () => {
    for (const name of [undefined, '', '   ', '/', '..', 5, 'a'.repeat(256)]) {
      assert.equal(
        statusOf(() => normalizeFileName(name, 'image/png')),
        400,
        String(name),
      );
    }
  });
});

describe('extensionFor', () => {
  it('maps each accepted type to one extension', () => {
    assert.equal(extensionFor('image/jpeg'), '.jpg');
    assert.equal(extensionFor('image/png'), '.png');
    assert.equal(extensionFor('image/gif'), '.gif');
    assert.equal(extensionFor('image/webp'), '.webp');
    assert.equal(extensionFor('application/zip'), '');
  });
});

describe('assertContentMatchesType', () => {
  it('accepts bytes that match the declared type', () => {
    assertContentMatchesType(PNG, 'image/png');
    assertContentMatchesType(JPEG, 'image/jpeg');
    assertContentMatchesType(GIF, 'image/gif');
    assertContentMatchesType(WEBP, 'image/webp');
  });

  it('rejects a mismatch or non-image content with 400', () => {
    assert.equal(
      statusOf(() => {
        assertContentMatchesType(PNG, 'image/jpeg');
      }),
      400,
    );
    assert.equal(
      statusOf(() => {
        assertContentMatchesType(Buffer.from('<html>'), 'image/png');
      }),
      400,
    );
    assert.equal(
      statusOf(() => {
        assertContentMatchesType(Buffer.alloc(0), 'image/gif');
      }),
      400,
    );
  });
});

describe('stagedUploadErrorStatus', () => {
  it('uses the error’s own status, or the fallback', () => {
    assert.equal(stagedUploadErrorStatus(new StagedUploadError(413, 'big'), 500), 413);
    assert.equal(stagedUploadErrorStatus(new Error('x'), 500), 500);
    assert.equal(stagedUploadErrorStatus('x', 502), 502);
  });
});

describe('validation that runs before any S3 call', () => {
  it('createStagedUpload rejects bad input with 400', async () => {
    const base = {
      userId: 'u1',
      purpose: 'account-photo',
      fileName: 'a.png',
      mimeType: 'image/png',
    };
    for (const override of [{ purpose: 'nope' }, { mimeType: 'image/svg+xml' }, { fileName: '' }]) {
      await assert.rejects(
        createStagedUpload({ ...base, ...override }),
        (e: unknown) => stagedUploadErrorStatus(e, 0) === 400,
      );
    }
  });

  it('consumeStagedUpload rejects a key outside the caller’s folder with 400', async () => {
    for (const stagingKey of ['tmp/staging/u2/a.png', 'media/users/u1/a.png', undefined]) {
      await assert.rejects(
        consumeStagedUpload({
          userId: 'u1',
          stagingKey,
          fileName: 'a.png',
          purpose: 'account-photo',
        }),
        (e: unknown) => stagedUploadErrorStatus(e, 0) === 400,
      );
    }
  });
});
