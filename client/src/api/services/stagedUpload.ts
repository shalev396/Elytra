import { api } from '@/api/instance';
import type { ApiRequestConfig } from '@/types';
import type {
  ApiSuccessResponse,
  PresignUploadRequestBody,
  PresignUploadResponseData,
  StagedFileReference,
  UploadPurpose,
} from '@api-types/api-contracts';

export type { UploadPurpose };

export interface UploadRule {
  maxBytes: number;
  mimeTypes: readonly string[];
}

/** Common web image formats up to 5 MiB. SVG is excluded on purpose (it can carry script). */
export const IMAGE_UPLOAD_RULE: UploadRule = {
  maxBytes: 5 * 1024 * 1024,
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

/**
 * Client-side mirror of the server's upload limits. The server enforces them again (presign
 * allowlist, S3 `content-length-range`, magic-byte sniff); checking here just fails fast with a
 * friendly message instead of a round trip.
 */
export const UPLOAD_RULES: Record<UploadPurpose, UploadRule> = {
  'account-photo': IMAGE_UPLOAD_RULE,
};

export type StagedUploadErrorCode = 'tooLarge' | 'invalidType' | 'uploadFailed';

/**
 * Thrown by stageFile for failures the axios interceptor does not report: client-side
 * validation and the direct S3 upload. `i18nKey` and `params` are ready for `t()`.
 */
export class StagedUploadError extends Error {
  readonly code: StagedUploadErrorCode;
  readonly i18nKey: string;
  readonly params: Record<string, string | number>;

  constructor(code: StagedUploadErrorCode, params: Record<string, string | number> = {}) {
    super(`Staged upload failed: ${code}`);
    this.name = 'StagedUploadError';
    this.code = code;
    this.i18nKey = `upload.errors.${code}`;
    this.params = params;
  }
}

function tooLargeError(rule: UploadRule): StagedUploadError {
  return new StagedUploadError('tooLarge', {
    maxMb: Math.round((rule.maxBytes / (1024 * 1024)) * 10) / 10,
  });
}

/** "image/jpeg" → "JPEG" for user-facing messages. */
function describeMimeTypes(mimeTypes: readonly string[]): string {
  return mimeTypes.map((m) => (m.split('/')[1] ?? m).toUpperCase()).join(', ');
}

/**
 * Checks a file's type and size against a rule. Returns the error to report, or null when the
 * file is acceptable. Used by stageFile and by pickers that reject a file as soon as it is chosen.
 */
export function validateFileAgainstRule(file: File, rule: UploadRule): StagedUploadError | null {
  if (!rule.mimeTypes.includes(file.type)) {
    return new StagedUploadError('invalidType', { types: describeMimeTypes(rule.mimeTypes) });
  }
  if (file.size > rule.maxBytes) {
    return tooLargeError(rule);
  }
  return null;
}

/**
 * Uploads a file straight to S3 and returns the reference the API needs to consume it.
 *
 * Bytes must not travel through API Gateway: it base64-encodes the body into the Lambda event,
 * whose hard limit is 6291556 bytes, capping any upload at roughly 4.7 MB.
 *
 * Flow: validate locally → `POST /private/uploads/presign` → multipart POST to the presigned URL
 * (every returned field first, then `file` last, as S3 requires).
 *
 * Errors: a failed presign request is an axios error (the interceptor already showed a toast);
 * everything else is a {@link StagedUploadError} the caller must report.
 */
export async function stageFile(
  file: File,
  purpose: UploadPurpose,
  config?: ApiRequestConfig,
): Promise<StagedFileReference> {
  const invalid = validateFileAgainstRule(file, UPLOAD_RULES[purpose]);
  if (invalid) {
    throw invalid;
  }

  const body: PresignUploadRequestBody = { purpose, fileName: file.name, mimeType: file.type };
  const response = await api.post<ApiSuccessResponse<PresignUploadResponseData>>(
    '/private/uploads/presign',
    body,
    config,
  );
  const { stagingKey, uploadUrl, fields } = response.data.data;

  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  formData.append('file', file);

  // A bare fetch on purpose: the S3 request must carry no Authorization header and must not
  // pass through the axios baseURL or the 401-refresh interceptor.
  let upload: Response;
  try {
    upload = await fetch(uploadUrl, { method: 'POST', body: formData });
  } catch {
    throw new StagedUploadError('uploadFailed');
  }
  if (!upload.ok) {
    // S3 answers 400 EntityTooLarge when the content-length-range condition fails.
    if (upload.status === 400) {
      const text = await upload.text().catch(() => '');
      if (text.includes('EntityTooLarge')) {
        throw tooLargeError(UPLOAD_RULES[purpose]);
      }
    }
    throw new StagedUploadError('uploadFailed');
  }

  return { stagingKey, fileName: file.name };
}
