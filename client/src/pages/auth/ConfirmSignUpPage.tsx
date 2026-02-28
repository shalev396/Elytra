import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';
import { confirmSignup } from '@/api/services/authService';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@api-types/api-contracts';

export default function ConfirmSignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();

  const emailFromSignup = searchParams.get('email') ?? '';
  const [email, setEmail] = useState(emailFromSignup);
  const [code, setCode] = useState(searchParams.get('code') ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await confirmSignup({ email, code }, { suppressErrorToast: true });
      setIsConfirmed(true);
      setTimeout(() => {
        void navigate(pathTo(ROUTES.AUTH.LOGIN, language));
      }, 2000);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data.message ?? t('auth.confirm.error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isConfirmed) {
    return (
      <>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('auth.confirm.title')}
          </h1>
          <p className="text-muted-foreground text-balance">{t('auth.confirm.checking')}</p>
        </div>
        <div className="space-y-4 text-center">
          <Button asChild>
            <Link to={pathTo(ROUTES.AUTH.LOGIN, language)}>{t('auth.confirm.goToLogin')}</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('auth.confirm.title')}
        </h1>
        <p className="text-muted-foreground text-balance">{t('auth.confirm.checkEmail')}</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.login.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('auth.login.emailPlaceholder')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
            readOnly={emailFromSignup !== ''}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">{t('auth.confirm.codeLabel')}</Label>
          <Input
            id="code"
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
            }}
            required
            disabled={isLoading}
          />
        </div>

        <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
          {isLoading ? t('auth.confirm.verifying') : t('auth.confirm.verify')}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to={pathTo(ROUTES.AUTH.LOGIN, language)}
            className="text-primary hover:underline font-medium underline-offset-4"
          >
            {t('auth.confirm.goToLogin')}
          </Link>
        </p>
      </form>
    </>
  );
}
