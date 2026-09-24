import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { crc32 } from 'node:zlib';
import { stripImageMetadata, sniffImageMimeType } from './index.js';
import { buildOrientationApp1, readExifOrientation } from './jpeg.js';
import { PNG_SIGNATURE } from './sniff.js';
import { VP8X_FLAG_EXIF, VP8X_FLAG_ICC, VP8X_FLAG_XMP } from './webp.js';

const bytes = (...values: number[]): Buffer => Buffer.from(values);
const latin1 = (s: string): Buffer => Buffer.from(s, 'latin1');

// ─── JPEG ──────────────────────────────────────────────────────────────────────

function segment(marker: number, payload: Buffer): Buffer {
  const header = Buffer.alloc(4);
  header[0] = 0xff;
  header[1] = marker;
  header.writeUInt16BE(payload.length + 2, 2);
  return Buffer.concat([header, payload]);
}

/** An EXIF APP1 payload with Make (ASCII, offset value) before Orientation, as cameras write it. */
function exifPayload(orientation: number, littleEndian: boolean): Buffer {
  const tiff = Buffer.alloc(8 + 2 + 2 * 12 + 4 + 6);
  const w16 = (v: number, o: number): number =>
    littleEndian ? tiff.writeUInt16LE(v, o) : tiff.writeUInt16BE(v, o);
  const w32 = (v: number, o: number): number =>
    littleEndian ? tiff.writeUInt32LE(v, o) : tiff.writeUInt32BE(v, o);
  tiff.write(littleEndian ? 'II' : 'MM', 0, 'latin1');
  w16(42, 2);
  w32(8, 4);
  w16(2, 8);
  // Make = "Phone" (6 bytes incl. NUL), stored after the IFD
  w16(0x010f, 10);
  w16(2, 12);
  w32(6, 14);
  w32(38, 18);
  // Orientation
  w16(0x0112, 22);
  w16(3, 24);
  w32(1, 26);
  w16(orientation, 30);
  w32(0, 34);
  tiff.write('Phone\0', 38, 'latin1');
  return Buffer.concat([latin1('Exif\0\0'), tiff]);
}

const JPEG_APP0 = segment(0xe0, latin1('JFIF\0\x01\x01\0\0\x01\0\x01\0\0'));
const JPEG_XMP = segment(0xe1, latin1('http://ns.adobe.com/xap/1.0/\0<x:xmpmeta/>'));
const JPEG_ICC = segment(0xe2, latin1('ICC_PROFILE\0\x01\x01profile-bytes'));
const JPEG_COM = segment(0xfe, latin1('secret comment'));
const JPEG_ADOBE = segment(0xee, latin1('Adobe\0\x64\0\0\0\0\x01'));
const JPEG_DQT = segment(0xdb, Buffer.alloc(65, 1));
const JPEG_SOF = segment(0xc0, bytes(8, 0, 1, 0, 1, 1, 1, 0x11, 0));
const JPEG_SOS = segment(0xda, bytes(1, 1, 0, 0, 0x3f, 0));
// Entropy data with a stuffed 0xFF00 and a restart marker inside the scan
const JPEG_SCAN = bytes(0x12, 0xff, 0x00, 0x34, 0xff, 0xd0, 0x56);

function jpeg(...middle: Buffer[]): Buffer {
  return Buffer.concat([bytes(0xff, 0xd8), ...middle, bytes(0xff, 0xd9)]);
}

const JPEG_IMAGE_TAIL = [JPEG_DQT, JPEG_SOF, JPEG_SOS, JPEG_SCAN];

describe('stripImageMetadata: JPEG', () => {
  it('drops JFIF, XMP and COM, keeps ICC (APP2) and Adobe (APP14), and keeps image data', () => {
    const input = jpeg(JPEG_APP0, JPEG_XMP, JPEG_ICC, JPEG_COM, JPEG_ADOBE, ...JPEG_IMAGE_TAIL);
    const out = stripImageMetadata(input, 'image/jpeg');
    assert.deepEqual(out, jpeg(JPEG_ICC, JPEG_ADOBE, ...JPEG_IMAGE_TAIL));
  });

  it('replaces the EXIF APP1 with a minimal one that keeps only a non-default Orientation', () => {
    const input = jpeg(segment(0xe1, exifPayload(6, false)), JPEG_ICC, ...JPEG_IMAGE_TAIL);
    const out = stripImageMetadata(input, 'image/jpeg');
    assert.deepEqual(out, jpeg(buildOrientationApp1(6, false), JPEG_ICC, ...JPEG_IMAGE_TAIL));
    assert.equal(out.includes(latin1('Phone')), false);
  });

  it('keeps the EXIF byte order of the original', () => {
    const input = jpeg(segment(0xe1, exifPayload(8, true)), ...JPEG_IMAGE_TAIL);
    const out = stripImageMetadata(input, 'image/jpeg');
    const app1Payload = out.subarray(6, 6 + out.readUInt16BE(4) - 2);
    assert.deepEqual(readExifOrientation(app1Payload), { value: 8, littleEndian: true });
    assert.equal(out.toString('latin1', 12, 14), 'II');
  });

  it('writes no APP1 when Orientation is the default (1)', () => {
    const input = jpeg(segment(0xe1, exifPayload(1, false)), ...JPEG_IMAGE_TAIL);
    assert.deepEqual(stripImageMetadata(input, 'image/jpeg'), jpeg(...JPEG_IMAGE_TAIL));
  });

  it('writes a well-formed minimal APP1', () => {
    const app1 = buildOrientationApp1(3, false);
    assert.equal(app1.readUInt16BE(0), 0xffe1);
    assert.equal(app1.readUInt16BE(2), app1.length - 2);
    assert.deepEqual(readExifOrientation(app1.subarray(4)), { value: 3, littleEndian: false });
  });

  it('drops bytes after EOI', () => {
    const input = Buffer.concat([jpeg(...JPEG_IMAGE_TAIL), latin1('trailing-data')]);
    assert.deepEqual(stripImageMetadata(input, 'image/jpeg'), jpeg(...JPEG_IMAGE_TAIL));
  });

  it('returns the original buffer when the JPEG is truncated', () => {
    const input = Buffer.concat([bytes(0xff, 0xd8), JPEG_APP0.subarray(0, 6)]);
    assert.equal(stripImageMetadata(input, 'image/jpeg'), input);
  });
});

// ─── PNG ───────────────────────────────────────────────────────────────────────

function chunk(type: string, data: Buffer = Buffer.alloc(0)): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

function pngChunkTypes(buf: Buffer): string[] {
  const types: string[] = [];
  for (let o = 8; o + 12 <= buf.length; o += 12 + buf.readUInt32BE(o)) {
    types.push(buf.toString('latin1', o + 4, o + 8));
  }
  return types;
}

describe('stripImageMetadata: PNG', () => {
  const ihdr = chunk('IHDR', bytes(0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0));

  it('keeps decoding and color chunks, drops text, EXIF and time chunks', () => {
    const input = Buffer.concat([
      PNG_SIGNATURE,
      ihdr,
      chunk('gAMA', bytes(0, 0, 0xb1, 0x8f)),
      chunk('cHRM', Buffer.alloc(32)),
      chunk('sRGB', bytes(0)),
      chunk('iCCP', latin1('icc\0\0data')),
      chunk('tEXt', latin1('Author\0Someone')),
      chunk('iTXt', latin1('XML:com.adobe.xmp\0\0\0\0\0<x/>')),
      chunk('eXIf', latin1('MM\0*')),
      chunk('pHYs', Buffer.alloc(9)),
      chunk('tRNS', bytes(0)),
      chunk('IDAT', bytes(1, 2, 3)),
      chunk('tIME', Buffer.alloc(7)),
      chunk('IEND'),
      latin1('after-IEND'),
    ]);
    const out = stripImageMetadata(input, 'image/png');
    assert.deepEqual(pngChunkTypes(out), [
      'IHDR',
      'gAMA',
      'cHRM',
      'sRGB',
      'iCCP',
      'pHYs',
      'tRNS',
      'IDAT',
      'IEND',
    ]);
    assert.equal(out.includes(latin1('Someone')), false);
  });

  it('returns the original buffer when IEND is missing', () => {
    const input = Buffer.concat([PNG_SIGNATURE, ihdr, chunk('IDAT', bytes(1))]);
    assert.equal(stripImageMetadata(input, 'image/png'), input);
  });
});

// ─── GIF ───────────────────────────────────────────────────────────────────────

describe('stripImageMetadata: GIF', () => {
  const header = Buffer.concat([latin1('GIF89a'), bytes(1, 0, 1, 0, 0x80, 0, 0)]);
  const globalColors = bytes(0, 0, 0, 255, 255, 255);
  const netscape = Buffer.concat([
    bytes(0x21, 0xff, 0x0b),
    latin1('NETSCAPE2.0'),
    bytes(3, 1, 0, 0, 0),
  ]);
  const xmp = Buffer.concat([
    bytes(0x21, 0xff, 0x0b),
    latin1('XMP DataXMP'),
    bytes(4),
    latin1('<x/>'),
    bytes(0),
  ]);
  const comment = Buffer.concat([bytes(0x21, 0xfe, 6), latin1('secret'), bytes(0)]);
  const plainText = Buffer.concat([
    bytes(0x21, 0x01, 12),
    Buffer.alloc(12),
    bytes(2),
    latin1('hi'),
    bytes(0),
  ]);
  const gce = bytes(0x21, 0xf9, 4, 0, 10, 0, 0, 0);
  // Image descriptor with a 2-entry local color table, then LZW code size and one data block
  const image = Buffer.concat([
    bytes(0x2c, 0, 0, 0, 0, 1, 0, 1, 0, 0x80),
    bytes(1, 2, 3, 4, 5, 6),
    bytes(2, 2, 0x44, 0x01, 0),
  ]);

  it('drops comments, plain text and unknown application extensions', () => {
    const input = Buffer.concat([
      header,
      globalColors,
      netscape,
      comment,
      xmp,
      gce,
      image,
      plainText,
      bytes(0x3b),
    ]);
    const out = stripImageMetadata(input, 'image/gif');
    assert.deepEqual(out, Buffer.concat([header, globalColors, netscape, gce, image, bytes(0x3b)]));
  });

  it('returns the original buffer when the trailer is missing', () => {
    const input = Buffer.concat([header, globalColors, gce, image]);
    assert.equal(stripImageMetadata(input, 'image/gif'), input);
  });
});

// ─── WebP ──────────────────────────────────────────────────────────────────────

function riffChunk(id: string, data: Buffer): Buffer {
  const head = Buffer.alloc(8);
  head.write(id, 0, 'latin1');
  head.writeUInt32LE(data.length, 4);
  return Buffer.concat([head, data, data.length % 2 === 1 ? bytes(0) : Buffer.alloc(0)]);
}

function webp(...chunks: Buffer[]): Buffer {
  const body = Buffer.concat(chunks);
  const head = Buffer.alloc(12);
  head.write('RIFF', 0, 'latin1');
  head.writeUInt32LE(4 + body.length, 4);
  head.write('WEBP', 8, 'latin1');
  return Buffer.concat([head, body]);
}

function vp8x(flags: number): Buffer {
  const data = Buffer.alloc(10);
  data[0] = flags;
  return riffChunk('VP8X', data);
}

function webpChunkIds(buf: Buffer): string[] {
  const ids: string[] = [];
  for (let o = 12; o + 8 <= buf.length; ) {
    const size = buf.readUInt32LE(o + 4);
    ids.push(buf.toString('latin1', o, o + 4));
    o += 8 + size + (size % 2);
  }
  return ids;
}

describe('stripImageMetadata: WebP', () => {
  const ALPHA = 0x10;
  const iccp = riffChunk('ICCP', latin1('icc-profile'));
  const image = riffChunk('VP8L', latin1('odd'));
  const exif = riffChunk('EXIF', latin1('MM\0*gps'));
  const xmp = riffChunk('XMP ', latin1('<x:xmpmeta/>'));

  it('drops EXIF and XMP, keeps ICCP, and fixes the VP8X flags and RIFF size', () => {
    const allFlags = VP8X_FLAG_ICC | VP8X_FLAG_EXIF | VP8X_FLAG_XMP | ALPHA;
    const out = stripImageMetadata(webp(vp8x(allFlags), iccp, image, exif, xmp), 'image/webp');
    assert.deepEqual(out, webp(vp8x(VP8X_FLAG_ICC | ALPHA), iccp, image));
    assert.deepEqual(webpChunkIds(out), ['VP8X', 'ICCP', 'VP8L']);
    assert.equal(out.readUInt32LE(4), out.length - 8);
  });

  it('clears the ICC flag when no ICCP chunk exists', () => {
    const out = stripImageMetadata(
      webp(vp8x(VP8X_FLAG_ICC | VP8X_FLAG_EXIF), image, exif),
      'image/webp',
    );
    assert.deepEqual(out, webp(vp8x(0), image));
  });

  it('returns the original buffer when a chunk overruns the RIFF size', () => {
    const input = webp(vp8x(0), image);
    input.writeUInt32LE(1000, 16);
    assert.equal(stripImageMetadata(input, 'image/webp'), input);
  });
});

// ─── Dispatch ──────────────────────────────────────────────────────────────────

describe('sniffImageMimeType', () => {
  it('recognizes the four accepted formats by magic bytes', () => {
    assert.equal(sniffImageMimeType(bytes(0xff, 0xd8, 0xff, 0xe0)), 'image/jpeg');
    assert.equal(sniffImageMimeType(Buffer.concat([PNG_SIGNATURE, bytes(0)])), 'image/png');
    assert.equal(sniffImageMimeType(latin1('GIF87a....')), 'image/gif');
    assert.equal(sniffImageMimeType(latin1('GIF89a....')), 'image/gif');
    assert.equal(sniffImageMimeType(latin1('RIFF\0\0\0\0WEBPVP8 ')), 'image/webp');
  });

  it('rejects everything else', () => {
    assert.equal(sniffImageMimeType(latin1('<svg xmlns="http://www.w3.org/2000/svg"/>')), null);
    assert.equal(sniffImageMimeType(latin1('%PDF-1.7')), null);
    assert.equal(sniffImageMimeType(latin1('<html>')), null);
    assert.equal(sniffImageMimeType(latin1('RIFF\0\0\0\0WAVEfmt ')), null);
    assert.equal(sniffImageMimeType(Buffer.alloc(0)), null);
  });
});

describe('stripImageMetadata: dispatch', () => {
  it('leaves the buffer alone when the declared type does not match the bytes', () => {
    const input = jpeg(JPEG_COM, ...JPEG_IMAGE_TAIL);
    assert.equal(stripImageMetadata(input, 'image/png'), input);
  });

  it('accepts a declared type with parameters and any casing', () => {
    const input = jpeg(JPEG_COM, ...JPEG_IMAGE_TAIL);
    assert.deepEqual(
      stripImageMetadata(input, 'Image/JPEG; charset=binary'),
      jpeg(...JPEG_IMAGE_TAIL),
    );
  });

  it('returns non-images unchanged', () => {
    const input = latin1('<svg/>');
    assert.equal(stripImageMetadata(input, 'image/svg+xml'), input);
  });
});
