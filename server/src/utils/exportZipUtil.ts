import { zipSync } from 'fflate';
import type { UserData } from '../models/definitions/User.js';
import type { MediaData } from '../models/definitions/Media.js';
import { userDataToCsv } from './csvUtil.js';
import { getObjectBuffer } from './s3Util.js';

/**
 * Creates a ZIP buffer containing user-data.csv and user assets from S3.
 */
export async function createUserExportZip(
  user: UserData,
  media: MediaData[],
  photoUrl: string | null,
): Promise<Buffer> {
  const csv = userDataToCsv(user, media, photoUrl);
  const mediaBuffers = await Promise.all(media.map((m) => getObjectBuffer(m.s3Key)));

  const files: Record<string, Uint8Array> = {
    'user-data.csv': new TextEncoder().encode(csv),
  };

  const usedNames = new Set<string>();
  for (let i = 0; i < media.length; i++) {
    const m = media[i];
    const buf = mediaBuffers[i];
    if (m === undefined || buf === undefined) continue;

    let assetName = m.fileName;
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
    files[`assets/${assetName}`] = new Uint8Array(buf);
  }

  const zipped = zipSync(files, { level: 6 });
  return Buffer.from(zipped.buffer, zipped.byteOffset, zipped.byteLength);
}
