import type { UserData } from '../models/definitions/User.js';
import type { MediaData } from '../models/definitions/Media.js';

function escapeCsvValue(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(d: Date | null): string {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString();
}

/**
 * Builds a CSV string with User and Media database records for export.
 */
export function userDataToCsv(user: UserData, media: MediaData[], photoUrl: string | null): string {
  const lines: string[] = [];

  const userHeader = [
    'type',
    'id',
    'cognitoSub',
    'name',
    'email',
    'photoUrl',
    'photoId',
    'lastLoginAt',
    'createdAt',
    'updatedAt',
  ].join(',');
  const userRow = [
    'user',
    escapeCsvValue(user.id),
    escapeCsvValue(user.cognitoSub),
    escapeCsvValue(user.name),
    escapeCsvValue(user.email),
    escapeCsvValue(photoUrl),
    escapeCsvValue(user.photoId),
    escapeCsvValue(formatDate(user.lastLoginAt)),
    escapeCsvValue(formatDate(user.createdAt)),
    escapeCsvValue(formatDate(user.updatedAt)),
  ].join(',');
  lines.push(userHeader);
  lines.push(userRow);

  if (media.length > 0) {
    lines.push('');
    const mediaHeader = [
      'type',
      'id',
      's3Key',
      'fileName',
      'mimeType',
      'size',
      'uploadedBy',
      'createdAt',
      'updatedAt',
    ].join(',');
    lines.push(mediaHeader);
    for (const m of media) {
      const mediaRow = [
        'media',
        escapeCsvValue(m.id),
        escapeCsvValue(m.s3Key),
        escapeCsvValue(m.fileName),
        escapeCsvValue(m.mimeType),
        escapeCsvValue(m.size),
        escapeCsvValue(m.uploadedBy),
        escapeCsvValue(formatDate(m.createdAt)),
        escapeCsvValue(formatDate(m.updatedAt)),
      ].join(',');
      lines.push(mediaRow);
    }
  }

  return lines.join('\n');
}
