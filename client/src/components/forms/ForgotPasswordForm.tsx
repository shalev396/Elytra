import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';
import { forgotPassword } from '@/api/services/authService';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@api-types/api-contracts';

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await forgotPassword({ email }, { suppressErrorToast: true });
      void navigate(
        `${pathTo(ROUTES.AUTH.RESET_PASSWORD, language)}?email=${encodeURIComponent(email)}`,
      );
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data.message ?? t('auth.forgotPassword.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-xl font-semibold">{t('auth.forgotPassword.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('auth.forgotPassword.description')}</p>
      </div>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <FieldGroup>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <Field>
            <FieldLabel htmlFor="email">{t('auth.forgotPassword.email')}</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.forgotPassword.emailPlaceholder')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
              disabled={isLoading}
            />
          </Field>
          <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.submit')}
            </Button>
            <FieldDescription className="text-center">
              {t('auth.forgotPassword.rememberPassword')}{' '}
              <Link
                to={pathTo(ROUTES.AUTH.LOGIN, language)}
                className="transition-colors duration-200 hover:text-primary"
              >
                {t('auth.forgotPassword.signIn')}
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
