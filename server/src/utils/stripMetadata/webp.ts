import { MAX_STRIP_BYTES, isWebp } from './sniff.js';

/**
 * WebP: drops the EXIF and XMP chunks and keeps everything else (VP8/VP8L/VP8X/ALPH/ANIM/ANMF and
 * the ICCP color profile). The VP8X feature flags and the RIFF size are rewritten to match the
 * chunks that remain, since decoders may reject a file whose flags promise missing chunks.
 */

const DROPPED_CHUNKS: ReadonlySet<string> = new Set(['EXIF', 'XMP ']);

/** VP8X flag bits (first payload byte). */
export const VP8X_FLAG_ICC = 0x20;
export const VP8X_FLAG_EXIF = 0x08;
export const VP8X_FLAG_XMP = 0x04;

const MAX_CHUNKS = 50_000;

/** The stripped WebP, or null when the input can't be parsed (the caller keeps the original). */
export function stripWebp(buf: Buffer): Buffer | null {
  if (buf.length < 20 || buf.length > MAX_STRIP_BYTES || !isWebp(buf)) return null;

  const riffEnd = 8 + buf.readUInt32LE(4);
  if (riffEnd > buf.length || riffEnd < 12) return null;

  const kept: Buffer[] = [];
  let vp8xIndex = -1;
  let hasIcc = false;
  let offset = 12;

  for (let n = 0; n < MAX_CHUNKS && offset + 8 <= riffEnd; n++) {
    const id = buf.toString('latin1', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    const end = offset + 8 + size + (size % 2);
    if (end > riffEnd) return null;

    if (!DROPPED_CHUNKS.has(id)) {
      if (id === 'VP8X') {
        if (size < 10) return null;
        vp8xIndex = kept.length;
        kept.push(Buffer.from(buf.subarray(offset, end))); // a copy: its flags are rewritten
      } else {
        if (id === 'ICCP') hasIcc = true;
        kept.push(buf.subarray(offset, end));
      }
    }
    offset = end;
  }
  if (offset !== riffEnd) return null;

  const vp8x = kept[vp8xIndex];
  if (vp8x !== undefined) {
    let flags = (vp8x[8] ?? 0) & ~(VP8X_FLAG_EXIF | VP8X_FLAG_XMP);
    flags = hasIcc ? flags | VP8X_FLAG_ICC : flags & ~VP8X_FLAG_ICC;
    vp8x[8] = flags;
  }

  const body = Buffer.concat(kept);
  const header = Buffer.from(buf.subarray(0, 12));
  header.writeUInt32LE(4 + body.length, 4);
  return Buffer.concat([header, body]);
}
