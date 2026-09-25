import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FadeContent } from '@/components/animations/FadeContent';
import { ArrowLeft } from 'lucide-react';
import { PageMetadata } from '@/components/shared/PageMetadata';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useMe, useUpdateMe } from '@/api/queries';
import { stageFile, StagedUploadError, UPLOAD_RULES } from '@/api/services/stagedUpload';
import { pageTitle } from '@/data/pageTitles';
import { useLanguage } from '@/hooks/useLanguage';
import { pathTo, ROUTES } from '@/router/routes';
import type { UpdateMeRequestBody } from '@api-types/api-contracts';

const PHOTO_RULE = UPLOAD_RULES['account-photo'];

export default function EditProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: meData } = useMe();
  const updateMe = useUpdateMe();

  // Undefined until the user types, so the field shows the server name once it arrives.
  const [nameDraft, setNameDraft] = useState<string>();
  const name = nameDraft ?? meData?.name ?? '';

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [isStaging, setIsStaging] = useState(false);

  const currentPhotoUrl = meData?.photoUrl ?? null;
  const isSaving = isStaging || updateMe.isPending;

  const nameChanged = name !== '' && name !== (meData?.name ?? '');
  const hasChanges = nameChanged || photoFile !== null || photoRemoved;

  function handlePhotoChange(file: File | null) {
    setPhotoFile(file);
    // Clearing only means "remove" when there is a saved photo to remove.
    setPhotoRemoved(file === null && currentPhotoUrl !== null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!hasChanges) {
      toast.info(t('profile.edit.noChanges'));
      return;
    }

    const payload: UpdateMeRequestBody = {};
    if (nameChanged) {
      payload.name = name;
    }

    try {
      if (photoFile) {
        setIsStaging(true);
        try {
          payload.photo = await stageFile(photoFile, 'account-photo');
        } finally {
          setIsStaging(false);
        }
      } else if (photoRemoved) {
        payload.removePhoto = true;
      }
      await updateMe.mutateAsync(payload);
      toast.success(t('profile.edit.success'));
      void navigate(pathTo(ROUTES.PROFILE, language));
    } catch (err) {
      // API errors are already reported by the axios interceptor; the direct S3 upload and
      // client-side validation are not, so report those here.
      if (err instanceof StagedUploadError) {
        toast.error(t(err.i18nKey, err.params));
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <PageMetadata title={pageTitle(t('profile.edit.title'))} noIndex />
      <div className="mx-auto max-w-2xl space-y-6">
        <FadeContent>
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              onClick={() => {
                void navigate(pathTo(ROUTES.PROFILE, language));
              }}
            >
              <ArrowLeft className="me-2 size-4" />
              {t('profile.title')}
            </Button>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t('profile.edit.title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('profile.edit.subtitle')}</p>
          </div>
        </FadeContent>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          <FadeContent delay={50}>
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.edit.photoLabel')}</CardTitle>
                <CardDescription>{t('profile.edit.photoHint')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={photoRemoved ? null : currentPhotoUrl}
                  onChange={handlePhotoChange}
                  rule={PHOTO_RULE}
                  chooseLabel={t('profile.edit.chooseFile')}
                  changeLabel={t('profile.edit.changeFile')}
                  removeLabel={t('profile.edit.removeFile')}
                  previewAlt={t('profile.edit.photoPreviewAlt')}
                  disabled={isSaving}
                />
                {photoFile && (
                  <p className="text-muted-foreground mt-2 truncate text-xs">{photoFile.name}</p>
                )}
              </CardContent>
            </Card>
          </FadeContent>

          <FadeContent delay={100}>
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.info.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('profile.edit.nameLabel')}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setNameDraft(e.target.value);
                    }}
                    placeholder={t('profile.edit.namePlaceholder')}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="email">{t('profile.edit.emailLabel')}</Label>
                  <Input
                    id="email"
                    value={meData?.email ?? ''}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-muted-foreground text-xs">{t('profile.edit.emailReadonly')}</p>
                </div>
              </CardContent>
            </Card>
          </FadeContent>

          <FadeContent delay={150}>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving || !hasChanges}>
                {isSaving ? t('profile.edit.submitting') : t('profile.edit.submit')}
              </Button>
            </div>
          </FadeContent>
        </form>
      </div>
    </div>
  );
}
