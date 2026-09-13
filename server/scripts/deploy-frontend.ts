import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import {
  DeleteObjectsCommand,
  paginateListObjectsV2,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { resolveRegion } from '../infra/lib/constants.js';
import { readStackOutputs } from '../infra/lib/stack-outputs.js';
import { CLIENT_DIST, CLIENT_ROOT } from './paths.js';
import { fail, runNpm, stageFromArgs } from './stage.js';

/**
 * npm run deploy:frontend -- <stage>
 *
 *   1. build the client (client/dist)
 *   2. upload it to the stage's client bucket (S3ClientBucketName): hashed assets/ cached for a
 *      year, other files for 5 minutes, index.html last and never cached, so it only ever points
 *      at uploaded assets. Unchanged files are skipped; files no longer in the build are deleted.
 *   3. invalidate the CloudFront distribution (CloudFrontDistributionId)
 *
 * Inputs: AWS credentials and a deployed stack. Run `npm ci` in server/ and client/ first.
 */

const LABEL = 'deploy:frontend';
const stage = stageFromArgs(LABEL);

const CACHE = {
  immutable: 'public,max-age=31536000,immutable',
  short: 'public,max-age=300',
  none: 'no-cache',
} as const;

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wasm': 'application/wasm',
  '.pdf': 'application/pdf',
};

interface ClientFile {
  key: string;
  body: Buffer;
  md5: string;
  cacheControl: string;
  contentType: string;
}

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function toClientFile(path: string): ClientFile {
  const key = relative(CLIENT_DIST, path).split(sep).join('/');
  const body = readFileSync(path);
  return {
    key,
    body,
    md5: createHash('md5').update(body).digest('hex'),
    cacheControl:
      key === 'index.html' ? CACHE.none : key.startsWith('assets/') ? CACHE.immutable : CACHE.short,
    contentType: CONTENT_TYPES[extname(key).toLowerCase()] ?? 'application/octet-stream',
  };
}

/** Runs `task` over `items`, at most `limit` at a time. */
async function inBatches<T>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += limit) {
    await Promise.all(items.slice(i, i + limit).map(task));
  }
}

// 1. Build
runNpm(LABEL, 'building the client', CLIENT_ROOT, ['run', 'build']);
if (!existsSync(join(CLIENT_DIST, 'index.html'))) fail(LABEL, `no index.html in ${CLIENT_DIST}`);

const { clientBucketName, distributionId } = await readStackOutputs(stage, [
  'clientBucketName',
  'distributionId',
]);

// 2. Upload
const s3 = new S3Client({ region: resolveRegion() });
const remote = new Map<string, string>();
for await (const page of paginateListObjectsV2({ client: s3 }, { Bucket: clientBucketName })) {
  for (const object of page.Contents ?? []) {
    if (object.Key !== undefined) remote.set(object.Key, (object.ETag ?? '').replaceAll('"', ''));
  }
}

const files = listFiles(CLIENT_DIST).map(toClientFile);
const changed = files.filter((f) => remote.get(f.key) !== f.md5);
const upload = async (file: ClientFile): Promise<void> => {
  await s3.send(
    new PutObjectCommand({
      Bucket: clientBucketName,
      Key: file.key,
      Body: file.body,
      CacheControl: file.cacheControl,
      ContentType: file.contentType,
    }),
  );
};

const built = new Set(files.map((f) => f.key));
const stale = [...remote.keys()].filter((key) => !built.has(key));
console.warn(
  `[${LABEL}] ${String(changed.length)} of ${String(files.length)} files to upload, ${String(stale.length)} stale to delete in ${clientBucketName}`,
);
const shell = changed.filter((f) => f.key === 'index.html');
const assets = changed.filter((f) => f.key.startsWith('assets/'));
const others = changed.filter((f) => f.key !== 'index.html' && !f.key.startsWith('assets/'));
await inBatches(assets, 10, upload);
await inBatches(others, 10, upload);
await inBatches(shell, 1, upload);

for (let i = 0; i < stale.length; i += 1000) {
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: clientBucketName,
      Delete: { Objects: stale.slice(i, i + 1000).map((Key) => ({ Key })), Quiet: true },
    }),
  );
}
console.warn(`[${LABEL}] deleted ${String(stale.length)} stale files`);

// 3. Invalidate
const cloudFront = new CloudFrontClient({ region: 'us-east-1' }); // CloudFront is global
const { Invalidation } = await cloudFront.send(
  new CreateInvalidationCommand({
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: `${stage}-${String(Date.now())}`,
      Paths: { Quantity: 1, Items: ['/*'] },
    },
  }),
);
console.warn(`[${LABEL}] invalidation ${Invalidation?.Id ?? '?'} created for ${distributionId}`);
