import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { pathTo, ROUTES } from '@/router/routes';

export default function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lng } = useParams<{ lng: string }>();
  const language = lng ?? 'en';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void navigate(pathTo(ROUTES.DASHBOARD, language));
  };

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('auth.signUp.title')}
        </h1>
        <p className="text-muted-foreground text-balance">{t('auth.signUp.description')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">{t('auth.signUp.fullName')}</Label>
          <Input id="name" type="text" placeholder={t('auth.signUp.namePlaceholder')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.signUp.email')}</Label>
          <Input id="email" type="email" placeholder={t('auth.signUp.emailPlaceholder')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.signUp.password')}</Label>
          <Input id="password" type="password" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">{t('auth.signUp.confirmPassword')}</Label>
          <Input id="confirm-password" type="password" />
        </div>
        <Button type="submit" variant="gradient" className="w-full">
          {t('auth.signUp.submit')}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          {t('auth.signUp.haveAccount')}{' '}
          <Link
            to={pathTo(ROUTES.AUTH.LOGIN, language)}
            className="text-primary hover:underline font-medium underline-offset-4"
          >
            {t('auth.signUp.signIn')}
          </Link>
        </p>
      </form>
    </>
  );
}
