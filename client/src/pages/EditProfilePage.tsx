import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { FadeContent } from '@/components/animations/FadeContent';
import { Upload, X, ArrowLeft } from 'lucide-react';
import { useMe, useUpdateMe } from '@/api/queries';
import { useLanguage } from '@/hooks/useLanguage';
import { pathTo, ROUTES } from '@/router/routes';

function getInitials(name: string | undefined, email: string | undefined) {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email?.[0]?.toUpperCase() ?? 'U';
}

export default function EditProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: meData } = useMe();
  const updateMe = useUpdateMe();

  const [name, setName] = useState(meData?.name ?? '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPhotoUrl = meData?.photoUrl ?? null;
  const displayPreview = photoRemoved ? null : (photoPreview ?? currentPhotoUrl);
  const initials = getInitials(name || meData?.name, meData?.email);

  const hasChanges =
    (name !== '' && name !== (meData?.name ?? '')) || photoFile !== null || photoRemoved;

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setPhotoFile(file);
    setPhotoRemoved(false);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!hasChanges) {
      toast.info(t('profile.edit.noChanges'));
      return;
    }

    const formData = new FormData();

    if (name !== '' && name !== (meData?.name ?? '')) {
      formData.append('name', name);
    }

    if (photoFile) {
      formData.append('photo', photoFile);
    } else if (photoRemoved) {
      formData.append('removePhoto', 'true');
    }

    try {
      await updateMe.mutateAsync(formData);
      toast.success(t('profile.edit.success'));
      void navigate(pathTo(ROUTES.PROFILE, language));
    } catch {
      // Error toast is handled by the axios interceptor
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
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
              <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <Avatar className="size-24 text-2xl">
                  {displayPreview ? (
                    <AvatarImage src={displayPreview} alt={name || 'Profile'} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="me-2 size-4" />
                      {photoFile || currentPhotoUrl
                        ? t('profile.edit.changeFile')
                        : t('profile.edit.chooseFile')}
                    </Button>
                    {(photoFile ?? (currentPhotoUrl && !photoRemoved)) && (
                      <Button type="button" variant="ghost" size="sm" onClick={handleRemovePhoto}>
                        <X className="me-2 size-4" />
                        {t('profile.edit.removeFile')}
                      </Button>
                    )}
                  </div>
                  {photoFile && <p className="text-muted-foreground text-xs">{photoFile.name}</p>}
                </div>
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
                      setName(e.target.value);
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
              <Button type="submit" disabled={updateMe.isPending || !hasChanges}>
                {updateMe.isPending ? t('profile.edit.submitting') : t('profile.edit.submit')}
              </Button>
            </div>
          </FadeContent>
        </form>
      </div>
    </div>
  );
}
