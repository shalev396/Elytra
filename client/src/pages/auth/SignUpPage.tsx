import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { pathTo, ROUTES } from '@/router/routes';
import { signup } from '@/api/services/authService';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@api-types/api-contracts';

export default function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lng } = useParams<{ lng: string }>();
  const language = lng ?? 'en';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('auth.signUp.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      await signup({ name, email, password }, { suppressErrorToast: true });
      void navigate(
        `${pathTo(ROUTES.AUTH.CONFIRM_SIGNUP, language)}?email=${encodeURIComponent(email)}`,
        { state: { fromSignup: true } },
      );
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data.message ?? t('auth.signUp.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('auth.signUp.title')}
        </h1>
        <p className="text-muted-foreground text-balance">{t('auth.signUp.description')}</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">{t('auth.signUp.fullName')}</Label>
          <Input
            id="name"
            type="text"
            placeholder={t('auth.signUp.namePlaceholder')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.signUp.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('auth.signUp.emailPlaceholder')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.signUp.password')}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            required
            minLength={8}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">{t('auth.signUp.confirmPassword')}</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
            required
            minLength={8}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
          {isLoading ? t('auth.signUp.loading') : t('auth.signUp.submit')}
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
