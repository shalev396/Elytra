import { MAX_STRIP_BYTES } from './sniff.js';

/**
 * JPEG: keeps every segment needed to decode the image, plus
 * - APP2 (ICC color profile) and APP14 (Adobe color transform), without which CMYK and
 *   wide-gamut images render with shifted colors;
 * - the EXIF Orientation tag, rewritten into a minimal APP1 so phone photos don't show rotated.
 * Every other APPn segment (JFIF, EXIF with GPS/camera data, XMP, IPTC, …), COM segments and any
 * bytes after EOI are dropped.
 */

const MAX_SEGMENTS = 50_000;

const SOI = 0xd8;
const EOI = 0xd9;
const SOS = 0xda;
const TEM = 0x01;
const COM = 0xfe;
const APP0 = 0xe0;
const APP1 = 0xe1;
const APP2 = 0xe2;
const APP14 = 0xee;
const APP15 = 0xef;

const KEPT_APP_MARKERS = new Set([APP2, APP14]);

const EXIF_HEADER = Buffer.from('Exif\0\0', 'latin1');
const TAG_ORIENTATION = 0x0112;
const TYPE_SHORT = 3;

function isRst(marker: number): boolean {
  return marker >= 0xd0 && marker <= 0xd7;
}

/**
 * Orientation (1–8) from an APP1 payload (the bytes after the length field), or null when the
 * segment is not EXIF or has no valid Orientation tag in IFD0.
 */
export function readExifOrientation(
  payload: Buffer,
): { value: number; littleEndian: boolean } | null {
  if (payload.length < EXIF_HEADER.length + 8) return null;
  if (!payload.subarray(0, EXIF_HEADER.length).equals(EXIF_HEADER)) return null;
  const tiff = payload.subarray(EXIF_HEADER.length);
  const order = tiff.toString('latin1', 0, 2);
  if (order !== 'II' && order !== 'MM') return null;
  const littleEndian = order === 'II';
  const u16 = (o: number): number => (littleEndian ? tiff.readUInt16LE(o) : tiff.readUInt16BE(o));
  const u32 = (o: number): number => (littleEndian ? tiff.readUInt32LE(o) : tiff.readUInt32BE(o));
  if (u16(2) !== 42) return null;
  const ifd0 = u32(4);
  if (ifd0 < 8 || ifd0 + 2 > tiff.length) return null;
  const count = u16(ifd0);
  for (let n = 0; n < count; n++) {
    const entry = ifd0 + 2 + n * 12;
    if (entry + 12 > tiff.length) return null;
    if (u16(entry) !== TAG_ORIENTATION) continue;
    if (u16(entry + 2) !== TYPE_SHORT || u32(entry + 4) !== 1) return null;
    const value = u16(entry + 8);
    return value >= 1 && value <= 8 ? { value, littleEndian } : null;
  }
  return null;
}

/**
 * A complete APP1 segment (marker included) whose EXIF holds one IFD0 entry: Orientation.
 * The TIFF byte order of the original is kept.
 */
export function buildOrientationApp1(value: number, littleEndian: boolean): Buffer {
  // TIFF header (8) + entry count (2) + one entry (12) + next-IFD offset (4)
  const tiff = Buffer.alloc(26);
  const w16 = (v: number, o: number): void => {
    if (littleEndian) tiff.writeUInt16LE(v, o);
    else tiff.writeUInt16BE(v, o);
  };
  const w32 = (v: number, o: number): void => {
    if (littleEndian) tiff.writeUInt32LE(v, o);
    else tiff.writeUInt32BE(v, o);
  };
  tiff.write(littleEndian ? 'II' : 'MM', 0, 'latin1');
  w16(42, 2);
  w32(8, 4); // IFD0 right after the header
  w16(1, 8); // one entry
  w16(TAG_ORIENTATION, 10);
  w16(TYPE_SHORT, 12);
  w32(1, 14); // count
  w16(value, 18); // value, left-justified in the 4-byte field; the padding stays 0
  w32(0, 22); // no next IFD

  const payload = Buffer.concat([EXIF_HEADER, tiff]);
  const header = Buffer.alloc(4);
  header[0] = 0xff;
  header[1] = APP1;
  header.writeUInt16BE(payload.length + 2, 2);
  return Buffer.concat([header, payload]);
}

/** Index of the marker that ends the entropy-coded data starting at `start`, or -1. */
function endOfEntropyData(buf: Buffer, start: number): number {
  let i = start;
  while (i < buf.length) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    if (i + 1 >= buf.length) return -1;
    const next = buf[i + 1] ?? 0;
    // 0xFF00 is a stuffed byte, RSTn markers live inside the scan, 0xFFFF is fill.
    if (next === 0x00 || isRst(next) || next === 0xff) {
      i += next === 0xff ? 1 : 2;
      continue;
    }
    return i;
  }
  return -1;
}

/** The stripped JPEG, or null when the input can't be parsed (the caller keeps the original). */
export function stripJpeg(buf: Buffer): Buffer | null {
  if (buf.length < 4 || buf.length > MAX_STRIP_BYTES || buf[0] !== 0xff || buf[1] !== SOI) {
    return null;
  }

  const out: Buffer[] = [];
  let orientation: Buffer | null = null;
  let i = 2;
  let segments = 0;

  const finish = (): Buffer =>
    Buffer.concat([
      Buffer.from([0xff, SOI]),
      ...(orientation === null ? [] : [orientation]),
      ...out,
      Buffer.from([0xff, EOI]),
    ]);

  while (i < buf.length && segments < MAX_SEGMENTS) {
    segments++;
    if (buf[i] !== 0xff) return null;
    let j = i;
    while (j < buf.length && buf[j] === 0xff) j++; // fill bytes
    if (j >= buf.length) return null;
    const marker = buf[j] ?? 0;
    j++; // j = first byte after the marker

    if (marker === EOI) return finish();
    if (marker === SOI) return null;
    if (marker === TEM || isRst(marker)) {
      out.push(Buffer.from([0xff, marker]));
      i = j;
      continue;
    }

    if (j + 2 > buf.length) return null;
    const segLen = buf.readUInt16BE(j);
    if (segLen < 2 || j + segLen > buf.length) return null;
    const segEnd = j + segLen;

    if (marker === COM || (marker >= APP0 && marker <= APP15)) {
      if (KEPT_APP_MARKERS.has(marker)) {
        out.push(buf.subarray(j - 2, segEnd));
      } else if (marker === APP1 && orientation === null) {
        const found = readExifOrientation(buf.subarray(j + 2, segEnd));
        if (found !== null && found.value !== 1) {
          orientation = buildOrientationApp1(found.value, found.littleEndian);
        }
      }
      i = segEnd;
      continue;
    }

    out.push(buf.subarray(j - 2, segEnd));
    i = segEnd;

    if (marker === SOS) {
      const scanEnd = endOfEntropyData(buf, i);
      if (scanEnd < 0) return null;
      out.push(buf.subarray(i, scanEnd));
      i = scanEnd;
    }
  }

  return null;
}
