/**
 * Ensures archiver types resolve under strict type-check.
 * @types/archiver uses export= with transitive deps that can be unresolved.
 */
declare module 'archiver' {
  import type { Transform } from 'stream';
  import type { ZlibOptions } from 'zlib';

  type Format = 'zip' | 'tar';
  interface ArchiverOptions {
    zlib?: ZlibOptions;
  }
  interface EntryData {
    name: string;
  }
  interface Archiver extends Transform {
    append(source: Buffer | string, data?: EntryData): this;
    finalize(): Promise<void>;
  }
  function archiver(format: Format, options?: ArchiverOptions): Archiver;
  export = archiver;
}
