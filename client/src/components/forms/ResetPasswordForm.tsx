import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';
import { resetPassword } from '@/api/services/authService';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@api-types/api-contracts';

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('auth.resetPassword.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ email, code, password }, { suppressErrorToast: true });
      void navigate(pathTo(ROUTES.AUTH.LOGIN, language));
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(axiosError.response?.data.message ?? t('auth.resetPassword.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-xl font-semibold">{t('auth.resetPassword.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('auth.resetPassword.description')}</p>
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
              disabled={isLoading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="code">{t('auth.resetPassword.code')}</FieldLabel>
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
          </Field>
          <Field>
            <FieldLabel htmlFor="password">{t('auth.resetPassword.newPassword')}</FieldLabel>
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
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">
              {t('auth.resetPassword.confirmPassword')}
            </FieldLabel>
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
            <FieldDescription>{t('auth.resetPassword.passwordHint')}</FieldDescription>
          </Field>
          <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('auth.resetPassword.resetting') : t('auth.resetPassword.submit')}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
