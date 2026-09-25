import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { safeEntryName } from './exportZipUtil.js';

describe('safeEntryName', () => {
  it('keeps an ordinary file name', () => {
    assert.equal(safeEntryName('photo (1).png'), 'photo (1).png');
    assert.equal(safeEntryName('my_file-2.jpeg'), 'my_file-2.jpeg');
  });

  it('keeps only the last path segment, so entries stay inside assets/ (zip slip)', () => {
    assert.equal(safeEntryName('../../etc/passwd'), 'passwd');
    assert.equal(safeEntryName('..\\..\\evil.sh'), 'evil.sh');
    assert.equal(safeEntryName('C:\\Users\\x\\y.png'), 'y.png');
    assert.equal(safeEntryName('/abs/path.png'), 'path.png');
  });

  it('replaces unsafe characters and drops leading dots', () => {
    assert.equal(safeEntryName('..hidden'), 'hidden');
    assert.equal(safeEntryName('a:b*c?.png'), 'a_b_c_.png');
    assert.equal(safeEntryName('evil\u0000.png'), 'evil_.png');
  });

  it('falls back to "file" for an empty or dots-only name', () => {
    assert.equal(safeEntryName(''), 'file');
    assert.equal(safeEntryName('..'), 'file');
    assert.equal(safeEntryName('dir/'), 'file');
  });

  it('caps the length', () => {
    assert.equal(safeEntryName(`${'a'.repeat(300)}.png`).length, 200);
  });
});
