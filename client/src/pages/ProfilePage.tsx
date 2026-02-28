import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { selectUser, logout } from '@/store/userSlice';
import { Mail, Pencil, Trash2 } from 'lucide-react';
import { FadeContent } from '@/components/animations/FadeContent';
import { useMe, useSendTestEmail, useDeleteAccount } from '@/api/queries';
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

export default function ProfilePage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { data: meData } = useMe();
  const { language } = useLanguage();
  const sendTestEmailMutation = useSendTestEmail();
  const deleteAccountMutation = useDeleteAccount();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const initials = getInitials(meData?.name ?? user?.name, meData?.email ?? user?.email);
  const photoUrl = meData?.photoUrl ?? null;

  const displayName = meData?.name ?? user?.name;
  const displayEmail = meData?.email ?? user?.email;
  const displayId = meData?.id;
  const displayCognitoSub = meData?.cognitoSub ?? user?.id;

  const handleSendTestEmail = () => {
    sendTestEmailMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(t('profile.testEmail.success'));
      },
      onError: () => {
        toast.error(t('profile.testEmail.error'));
      },
    });
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        dispatch(logout());
        void navigate(pathTo(ROUTES.HOME, language));
      },
      onError: () => {
        toast.error(t('profile.deleteAccount.error'));
      },
    });
  };

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
                {photoUrl ? <AvatarImage src={photoUrl} alt={displayName ?? 'Profile'} /> : null}
                <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="text-lg font-semibold">{displayName ?? t('profile.info.notSet')}</p>
                <p className="text-muted-foreground text-sm">{displayEmail}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={pathTo(ROUTES.EDIT_PROFILE, language)}>
                      <Pencil className="me-2 size-4" />
                      {t('profile.editButton')}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendTestEmail}
                    disabled={sendTestEmailMutation.isPending}
                  >
                    <Mail className="me-2 size-4" />
                    {sendTestEmailMutation.isPending
                      ? t('profile.testEmail.sending')
                      : t('profile.testEmail.button')}
                  </Button>
                  <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="me-2 size-4" />
                        {t('profile.deleteAccount.button')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t('profile.deleteAccount.dialogTitle')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('profile.deleteAccount.dialogDescription')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteAccountMutation.isPending}>
                          {t('profile.deleteAccount.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={deleteAccountMutation.isPending}
                        >
                          {deleteAccountMutation.isPending
                            ? t('profile.deleteAccount.deleting')
                            : t('profile.deleteAccount.confirm')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
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
              {displayId && (
                <div className="py-3">
                  <p className="text-muted-foreground text-sm font-medium">
                    {t('profile.info.userId')}
                  </p>
                  <p className="text-muted-foreground mt-1 break-all font-mono text-sm">
                    {displayId}
                  </p>
                </div>
              )}
              {displayId && <Separator />}
              <div className="py-3">
                <p className="text-muted-foreground text-sm font-medium">
                  {t('profile.info.cognitoSub')}
                </p>
                <p className="text-muted-foreground mt-1 break-all font-mono text-sm">
                  {displayCognitoSub}
                </p>
              </div>
              {meData?.lastLoginAt && (
                <>
                  <Separator />
                  <div className="py-3">
                    <p className="text-muted-foreground text-sm font-medium">
                      {t('profile.info.lastLogin')}
                    </p>
                    <p className="mt-1 text-base">
                      {new Date(meData.lastLoginAt).toLocaleString()}
                    </p>
                  </div>
                </>
              )}
              {meData?.createdAt && (
                <>
                  <Separator />
                  <div className="py-3">
                    <p className="text-muted-foreground text-sm font-medium">
                      {t('profile.info.memberSince')}
                    </p>
                    <p className="mt-1 text-base">
                      {new Date(meData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
              {meData?.updatedAt && (
                <>
                  <Separator />
                  <div className="py-3">
                    <p className="text-muted-foreground text-sm font-medium">
                      {t('profile.info.updatedAt')}
                    </p>
                    <p className="mt-1 text-base">
                      {new Date(meData.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </FadeContent>
      </div>
    </div>
  );
}
