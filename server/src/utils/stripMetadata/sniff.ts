import type { ImageMimeType } from '../../constants/uploadLimits.js';

/** Largest input the byte-level strippers will parse. Well above any upload limit. */
export const MAX_STRIP_BYTES = 50 * 1024 * 1024;

export const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function isJpeg(buf: Buffer): boolean {
  return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
}

export function isPng(buf: Buffer): boolean {
  return buf.length >= 8 && buf.subarray(0, 8).equals(PNG_SIGNATURE);
}

export function isGif(buf: Buffer): boolean {
  if (buf.length < 6) return false;
  const sig = buf.toString('latin1', 0, 6);
  return sig === 'GIF87a' || sig === 'GIF89a';
}

export function isWebp(buf: Buffer): boolean {
  return (
    buf.length >= 12 &&
    buf.toString('latin1', 0, 4) === 'RIFF' &&
    buf.toString('latin1', 8, 12) === 'WEBP'
  );
}

/** The image type the bytes actually are, from their magic number, or null for anything else. */
export function sniffImageMimeType(buf: Buffer): ImageMimeType | null {
  if (isJpeg(buf)) return 'image/jpeg';
  if (isPng(buf)) return 'image/png';
  if (isGif(buf)) return 'image/gif';
  if (isWebp(buf)) return 'image/webp';
  return null;
}

/** Lower-cased media type without parameters: "Image/PNG; x=y" → "image/png". */
export function normalizeMimeType(mimeType: string): string {
  return (mimeType.split(';', 1)[0] ?? '').trim().toLowerCase();
}
