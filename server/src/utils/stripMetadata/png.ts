import { MAX_STRIP_BYTES, PNG_SIGNATURE } from './sniff.js';

/**
 * PNG: chunks needed to decode and display the image correctly. Everything else — text chunks
 * (tEXt/zTXt/iTXt, often carrying software, author or tracking keys), eXIf, tIME and private
 * chunks — is dropped. Kept chunks are copied verbatim, CRC included.
 */
export const PNG_KEPT_CHUNKS: ReadonlySet<string> = new Set([
  // critical
  'IHDR',
  'PLTE',
  'IDAT',
  'IEND',
  // transparency and rendering
  'tRNS',
  'pHYs',
  'sBIT',
  'bKGD',
  // color management: without these, colors shift on wide-gamut or gamma-tagged images
  'gAMA',
  'cHRM',
  'sRGB',
  'iCCP',
  // APNG animation
  'acTL',
  'fcTL',
  'fdAT',
]);

const MAX_CHUNKS = 50_000;

/** The stripped PNG, or null when the input can't be parsed (the caller keeps the original). */
export function stripPng(buf: Buffer): Buffer | null {
  if (buf.length < 8 + 25 || buf.length > MAX_STRIP_BYTES) return null;
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) return null;

  const parts: Buffer[] = [PNG_SIGNATURE];
  let offset = 8;
  let chunks = 0;

  while (offset + 12 <= buf.length && chunks < MAX_CHUNKS) {
    const dataLen = buf.readUInt32BE(offset);
    const type = buf.toString('latin1', offset + 4, offset + 8);
    const end = offset + 12 + dataLen;
    if (end > buf.length) return null;
    if (chunks === 0 && (type !== 'IHDR' || dataLen !== 13)) return null;
    chunks++;

    if (PNG_KEPT_CHUNKS.has(type)) parts.push(buf.subarray(offset, end));
    if (type === 'IEND') return Buffer.concat(parts);
    offset = end;
  }

  return null;
}
