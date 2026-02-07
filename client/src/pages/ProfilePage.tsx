import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { selectUser } from '@/store/userSlice';
import { Upload } from 'lucide-react';
import { FadeContent } from '@/components/animations/FadeContent';

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

export default function ProfilePage() {
  const { t } = useTranslation();
  const user = useSelector(selectUser);
  const initials = getInitials(user?.name, user?.email);

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <FadeContent>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('profile.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('profile.subtitle')}</p>
          </div>
        </FadeContent>

        <FadeContent delay={50}>
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.avatar.title')}</CardTitle>
              <CardDescription>{t('profile.avatar.description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <Avatar className="size-24 text-2xl">
                <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Upload className="me-2 size-4" />
                  {t('profile.avatar.upload')}
                </Button>
                <p className="text-muted-foreground text-xs">{t('profile.avatar.comingSoon')}</p>
              </div>
            </CardContent>
          </Card>
        </FadeContent>

        <FadeContent delay={100}>
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.info.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="py-3">
                <p className="text-muted-foreground text-sm font-medium">
                  {t('profile.info.name')}
                </p>
                <p className="mt-1 text-base">{user?.name ?? t('profile.info.notSet')}</p>
              </div>
              <Separator />
              <div className="py-3">
                <p className="text-muted-foreground text-sm font-medium">
                  {t('profile.info.email')}
                </p>
                <p className="mt-1 text-base">{user?.email}</p>
              </div>
              <Separator />
              <div className="py-3">
                <p className="text-muted-foreground text-sm font-medium">
                  {t('profile.info.userId')}
                </p>
                <p className="mt-1 font-mono text-muted-foreground text-sm break-all">{user?.id}</p>
              </div>
            </CardContent>
          </Card>
        </FadeContent>
      </div>
    </div>
  );
}
