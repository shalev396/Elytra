import { useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  IMAGE_UPLOAD_RULE,
  validateFileAgainstRule,
  type StagedUploadError,
  type UploadRule,
} from '@/api/services/stagedUpload';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  /** Existing image URL to preview (null/undefined when there is none). */
  value?: string | null;
  /** Called with the chosen file, or null when the user clears the image. */
  onChange: (file: File | null) => void;
  /** Allowed MIME types and maximum size. Defaults to JPEG/PNG/WebP/GIF up to 5 MiB. */
  rule?: UploadRule;
  /** Called when a chosen file fails the rule. Defaults to an error toast. */
  onInvalid?: (error: StagedUploadError) => void;
  /** Button text when no image is set. */
  chooseLabel?: string;
  /** Button text when an image is set. */
  changeLabel?: string;
  /** Accessible name of the clear button. */
  removeLabel?: string;
  /** Alt text of the preview image. */
  previewAlt?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Single-image picker with drag and drop, preview and client-side type/size validation.
 *
 * The native file input is visually hidden and removed from the tab order; a real button opens
 * it, so the control is reachable and operable from the keyboard.
 */
export function ImageUpload({
  value,
  onChange,
  rule = IMAGE_UPLOAD_RULE,
  onInvalid,
  chooseLabel,
  changeLabel,
  removeLabel,
  previewAlt,
  disabled = false,
  className,
}: ImageUploadProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const preview = localPreview ?? value ?? null;

  function reportInvalid(error: StagedUploadError) {
    if (onInvalid) {
      onInvalid(error);
    } else {
      toast.error(t(error.i18nKey, error.params));
    }
  }

  function handleFile(file: File) {
    const invalid = validateFileAgainstRule(file, rule);
    if (invalid) {
      reportInvalid(invalid);
      return;
    }
    onChange(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLocalPreview(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so choosing the same file again still fires a change event.
    e.target.value = '';
    if (file) {
      handleFile(file);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) {
      return;
    }
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleClear() {
    setLocalPreview(null);
    onChange(null);
  }

  function openPicker() {
    inputRef.current?.click();
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-4 transition-colors sm:flex-row',
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        disabled && 'opacity-60',
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) {
          setIsDragging(true);
        }
      }}
      onDragLeave={() => {
        setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      <div className="relative shrink-0">
        {preview ? (
          <>
            <img
              src={preview}
              alt={previewAlt ?? t('imageUpload.previewAlt')}
              className="size-24 rounded-lg border object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon-xs"
              className="absolute -end-2 -top-2 rounded-full"
              onClick={handleClear}
              disabled={disabled}
              aria-label={removeLabel ?? t('imageUpload.remove')}
            >
              <X aria-hidden="true" />
            </Button>
          </>
        ) : (
          <div
            className="bg-muted/40 text-muted-foreground flex size-24 items-center justify-center rounded-lg border"
            aria-hidden="true"
          >
            <Upload className="size-8" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:items-start sm:text-start">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={rule.mimeTypes.join(',')}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
          onChange={handleInputChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openPicker}
          disabled={disabled}
          aria-describedby={hintId}
        >
          <Upload className="size-4" aria-hidden="true" />
          {preview
            ? (changeLabel ?? t('imageUpload.change'))
            : (chooseLabel ?? t('imageUpload.choose'))}
        </Button>
        <p id={hintId} className="text-muted-foreground text-xs">
          {t('imageUpload.dragHint')}
        </p>
      </div>
    </div>
  );
}
