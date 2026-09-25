import { zipSync } from 'fflate';
import type { UserData } from '../models/definitions/User.js';
import type { MediaData } from '../models/definitions/Media.js';
import { userDataToCsv } from './csvUtil.js';
import { runWithConcurrency } from './concurrency.js';
import { getObjectBuffer, isS3NotFound } from './s3Util.js';

const MAX_ENTRY_NAME_LENGTH = 200;

/**
 * A ZIP entry name from a user-supplied file name: the last path segment only, with anything but
 * letters, digits, space, dot, dash, underscore and parentheses replaced, and no leading dots. So a
 * name like "../../evil.sh" or "C:\x\y.png" can't place a file outside assets/ when the
 * archive is extracted (zip slip).
 */
export function safeEntryName(fileName: string): string {
  const base = fileName.split(/[/\\]/).pop() ?? '';
  const cleaned = base
    .replace(/[^\w .()-]/g, '_')
    .replace(/^[.\s]+/, '')
    .trim()
    .slice(0, MAX_ENTRY_NAME_LENGTH);
  return cleaned === '' ? 'file' : cleaned;
}

/** Parallel S3 reads while building an export. */
const EXPORT_S3_CONCURRENCY = 30;

/**
 * Creates a ZIP buffer containing user-data.csv and user assets from S3. A Media row whose object
 * is missing from S3 is skipped (and logged) rather than failing the whole export.
 */
export async function createUserExportZip(
  user: UserData,
  media: MediaData[],
  photoUrl: string | null,
): Promise<Buffer> {
  const csv = userDataToCsv(user, media, photoUrl);
  const mediaBuffers = await runWithConcurrency(
    media,
    EXPORT_S3_CONCURRENCY,
    async (m): Promise<Buffer | null> => {
      try {
        return await getObjectBuffer(m.s3Key);
      } catch (error) {
        if (!isS3NotFound(error)) throw error;
        console.warn(`Export: skipping media ${m.id}, S3 object ${m.s3Key} is missing`);
        return null;
      }
    },
  );

  const files: Record<string, Uint8Array> = {
    'user-data.csv': new TextEncoder().encode(csv),
  };

  const usedNames = new Set<string>();
  for (let i = 0; i < media.length; i++) {
    const m = media[i];
    const buf = mediaBuffers[i];
    if (m === undefined || buf === undefined || buf === null) continue;

    let assetName = safeEntryName(m.fileName);
    if (usedNames.has(assetName)) {
      const ext = assetName.includes('.') ? assetName.slice(assetName.lastIndexOf('.')) : '';
      const base = assetName.slice(0, assetName.length - ext.length);
      let suffix = 1;
      while (usedNames.has(`${base}_${String(suffix)}${ext}`)) {
        suffix++;
      }
      assetName = `${base}_${String(suffix)}${ext}`;
    }
    usedNames.add(assetName);
    // A Buffer is a Uint8Array view: no copy.
    files[`assets/${assetName}`] = buf;
  }

  const zipped = zipSync(files, { level: 6 });
  return Buffer.from(zipped.buffer, zipped.byteOffset, zipped.byteLength);
}
