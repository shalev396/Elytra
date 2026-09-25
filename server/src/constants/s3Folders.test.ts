import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  STAGING_PREFIX,
  EXPORTS_PREFIX,
  accountImageFolder,
  exportKeyFor,
  isValidStagingKey,
  stagingKeyFor,
} from './s3Folders.js';

const USER = 'user-123';

describe('stagingKeyFor', () => {
  it('puts the key in the owner folder under tmp/staging, outside media/', () => {
    const key = stagingKeyFor(USER, '.png');
    assert.match(key, /^tmp\/staging\/user-123\/[0-9a-f-]{36}\.png$/);
    assert.equal(key.startsWith('media/'), false);
  });

  it('allows an empty extension', () => {
    assert.match(stagingKeyFor(USER, ''), /^tmp\/staging\/user-123\/[0-9a-f-]{36}$/);
  });

  it('produces keys the owner check accepts', () => {
    assert.equal(isValidStagingKey(stagingKeyFor(USER, '.jpg'), USER), true);
  });

  it('never repeats', () => {
    assert.notEqual(stagingKeyFor(USER, '.png'), stagingKeyFor(USER, '.png'));
  });
});

describe('isValidStagingKey', () => {
  it('accepts a key directly in the caller’s staging folder', () => {
    assert.equal(isValidStagingKey(`${STAGING_PREFIX}/${USER}/abc.png`, USER), true);
  });

  it('rejects another user’s staged object', () => {
    assert.equal(isValidStagingKey(`${STAGING_PREFIX}/someone-else/abc.png`, USER), false);
    assert.equal(isValidStagingKey(`${STAGING_PREFIX}/${USER}x/abc.png`, USER), false);
  });

  it('rejects keys outside the staging prefix', () => {
    assert.equal(isValidStagingKey(`media/users/${USER}/abc.png`, USER), false);
    assert.equal(isValidStagingKey(`${EXPORTS_PREFIX}/${USER}/abc.zip`, USER), false);
    assert.equal(isValidStagingKey(`staging/${USER}/abc.png`, USER), false);
    assert.equal(isValidStagingKey(`/${STAGING_PREFIX}/${USER}/abc.png`, USER), false);
  });

  it('rejects the bare prefix and the bare owner folder', () => {
    assert.equal(isValidStagingKey(STAGING_PREFIX, USER), false);
    assert.equal(isValidStagingKey(`${STAGING_PREFIX}/${USER}`, USER), false);
    assert.equal(isValidStagingKey(`${STAGING_PREFIX}/${USER}/`, USER), false);
  });

  it('rejects nested paths, traversal and backslashes', () => {
    assert.equal(isValidStagingKey(`${STAGING_PREFIX}/${USER}/a/b.png`, USER), false);
    assert.equal(isValidStagingKey(`${STAGING_PREFIX}/${USER}/../other/b.png`, USER), false);
    assert.equal(isValidStagingKey(`${STAGING_PREFIX}/${USER}/..`, USER), false);
    assert.equal(isValidStagingKey(`${STAGING_PREFIX}/${USER}/a..b`, USER), false);
    assert.equal(isValidStagingKey(`${STAGING_PREFIX}/${USER}/a\\b.png`, USER), false);
  });

  it('rejects an empty or slash-containing user id', () => {
    assert.equal(isValidStagingKey(`${STAGING_PREFIX}//abc.png`, ''), false);
    assert.equal(isValidStagingKey(`${STAGING_PREFIX}/a/b/abc.png`, 'a/b'), false);
  });
});

describe('accountImageFolder', () => {
  it('keeps account photos in users/<userId>', () => {
    assert.equal(accountImageFolder(USER), 'users/user-123');
  });
});

describe('exportKeyFor', () => {
  it('puts export ZIPs in the owner folder under tmp/exports', () => {
    assert.match(exportKeyFor(USER), /^tmp\/exports\/user-123\/[0-9a-f-]{36}\.zip$/);
  });
});
