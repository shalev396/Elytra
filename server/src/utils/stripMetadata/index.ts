/**
 * Removes privacy-relevant metadata (EXIF with GPS and camera data, XMP, comments, text chunks)
 * from uploaded images, byte by byte and without re-encoding. JPEG, PNG, GIF and WebP only: the
 * upload allowlist accepts nothing else, and SVG/PDF can't be made safe this way.
 */
import { stripGif } from './gif.js';
import { stripJpeg } from './jpeg.js';
import { stripPng } from './png.js';
import { normalizeMimeType, sniffImageMimeType } from './sniff.js';
import { stripWebp } from './webp.js';

export { sniffImageMimeType, normalizeMimeType } from './sniff.js';

/**
 * The image without its metadata. The format is taken from the magic bytes; `mimeType` must be the
 * declared type of the same image, and a mismatch leaves the buffer untouched. Never throws: an
 * unknown or malformed image comes back as the original buffer.
 */
export function stripImageMetadata(buffer: Buffer, mimeType: string): Buffer {
  try {
    const actual = sniffImageMimeType(buffer);
    if (actual === null || actual !== normalizeMimeType(mimeType)) return buffer;

    let stripped: Buffer | null;
    switch (actual) {
      case 'image/jpeg':
        stripped = stripJpeg(buffer);
        break;
      case 'image/png':
        stripped = stripPng(buffer);
        break;
      case 'image/gif':
        stripped = stripGif(buffer);
        break;
      case 'image/webp':
        stripped = stripWebp(buffer);
        break;
    }
    return stripped ?? buffer;
  } catch (error) {
    console.warn('stripImageMetadata: keeping the original image:', error);
    return buffer;
  }
}
