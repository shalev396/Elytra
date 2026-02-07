import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { pathTo, ROUTES } from '@/router/routes';
import { setUser } from '@/store/userSlice';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { lng } = useParams<{ lng: string }>();
  const language = lng ?? 'en';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Temporarily set user as authenticated so dashboard is accessible
    dispatch(
      setUser({
        id: 'temp',
        email: 'guest@example.com',
        name: 'Guest',
      }),
    );
    void navigate(pathTo(ROUTES.DASHBOARD, language));
  };

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('auth.login.title')}
        </h1>
        <p className="text-muted-foreground text-balance">{t('auth.login.description')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.login.email')}</Label>
          <Input id="email" type="email" placeholder={t('auth.login.emailPlaceholder')} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t('auth.login.password')}</Label>
            <Link
              to={pathTo(ROUTES.AUTH.FORGOT_PASSWORD, language)}
              className="text-sm text-primary underline underline-offset-2 hover:no-underline"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {t('auth.login.submit')}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              {t('auth.login.orContinueWith')}
            </span>
          </div>
        </div>

        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className="w-full opacity-50 cursor-not-allowed"
            disabled
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-5 w-5">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            {t('auth.login.loginWithGoogle')}
          </Button>
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            Coming soon
          </span>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.login.noAccount')}{' '}
          <Link
            to={pathTo(ROUTES.AUTH.SIGNUP, language)}
            className="font-medium text-primary underline underline-offset-4 hover:no-underline"
          >
            {t('auth.login.signUp')}
          </Link>
        </p>
      </form>
    </>
  );
}
