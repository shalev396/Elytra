import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isS3AccessDenied, isS3NotFound } from './s3Util.js';

const sdkError = (name: string, status: number): Error =>
  Object.assign(new Error(name), { name, $metadata: { httpStatusCode: status } });

describe('S3 error predicates', () => {
  it('recognizes a missing object from HeadObject and GetObject', () => {
    assert.equal(isS3NotFound(sdkError('NotFound', 404)), true);
    assert.equal(isS3NotFound(sdkError('NoSuchKey', 404)), true);
    assert.equal(isS3NotFound(sdkError('AccessDenied', 403)), false);
  });

  it('recognizes a 403', () => {
    assert.equal(isS3AccessDenied(sdkError('AccessDenied', 403)), true);
    assert.equal(isS3AccessDenied(sdkError('Forbidden', 403)), true);
    assert.equal(isS3AccessDenied(sdkError('NotFound', 404)), false);
  });

  it('ignores non-errors', () => {
    for (const value of [null, undefined, 'NotFound', 404]) {
      assert.equal(isS3NotFound(value), false);
      assert.equal(isS3AccessDenied(value), false);
    }
  });
});
