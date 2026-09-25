import { MAX_STRIP_BYTES, isGif } from './sniff.js';

/**
 * GIF: keeps the header, color tables, image data, Graphic Control Extensions (frame timing and
 * transparency) and the NETSCAPE2.0 looping extension. Comment and plain-text extensions, and
 * every other application extension (XMP and the like), are dropped.
 */

const TRAILER = 0x3b;
const IMAGE_DESCRIPTOR = 0x2c;
const EXTENSION = 0x21;
const LABEL_GRAPHIC_CONTROL = 0xf9;
const LABEL_APPLICATION = 0xff;

const MAX_BLOCKS = 50_000;

function colorTableSize(packed: number): number {
  return packed & 0x80 ? 3 * (1 << ((packed & 0x07) + 1)) : 0;
}

/** End offset of the data sub-block chain starting at `start` (after its 0 terminator), or -1. */
function endOfSubBlocks(buf: Buffer, start: number): number {
  let i = start;
  for (let n = 0; n < MAX_BLOCKS; n++) {
    if (i >= buf.length) return -1;
    const len = buf[i] ?? 0;
    i += 1 + len;
    if (len === 0) return i <= buf.length ? i : -1;
  }
  return -1;
}

function isNetscapeLoop(buf: Buffer, extStart: number): boolean {
  // 0x21 0xFF 0x0B "NETSCAPE2.0"
  return (
    buf[extStart + 2] === 0x0b &&
    buf.toString('latin1', extStart + 3, extStart + 14) === 'NETSCAPE2.0'
  );
}

/** The stripped GIF, or null when the input can't be parsed (the caller keeps the original). */
export function stripGif(buf: Buffer): Buffer | null {
  if (buf.length < 14 || buf.length > MAX_STRIP_BYTES || !isGif(buf)) return null;

  // Header (6) + logical screen descriptor (7) + optional global color table
  let i = 13 + colorTableSize(buf[10] ?? 0);
  if (i > buf.length) return null;
  const out: Buffer[] = [buf.subarray(0, i)];

  for (let n = 0; n < MAX_BLOCKS && i < buf.length; n++) {
    const introducer = buf[i];

    if (introducer === TRAILER) {
      out.push(Buffer.from([TRAILER]));
      return Buffer.concat(out);
    }

    if (introducer === IMAGE_DESCRIPTOR) {
      // Descriptor (10) + optional local color table + LZW minimum code size (1) + sub-blocks
      if (i + 10 > buf.length) return null;
      const dataStart = i + 10 + colorTableSize(buf[i + 9] ?? 0) + 1;
      const end = endOfSubBlocks(buf, dataStart);
      if (end < 0) return null;
      out.push(buf.subarray(i, end));
      i = end;
      continue;
    }

    if (introducer === EXTENSION) {
      if (i + 2 > buf.length) return null;
      const label = buf[i + 1];
      const end = endOfSubBlocks(buf, i + 2);
      if (end < 0) return null;
      const keep =
        label === LABEL_GRAPHIC_CONTROL || (label === LABEL_APPLICATION && isNetscapeLoop(buf, i));
      if (keep) out.push(buf.subarray(i, end));
      i = end;
      continue;
    }

    return null;
  }

  return null;
}
