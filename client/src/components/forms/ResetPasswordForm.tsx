import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement actual reset password logic with Cognito
    void navigate(pathTo(ROUTES.AUTH.LOGIN, language));
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-xl font-semibold">{t('auth.resetPassword.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('auth.resetPassword.description')}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">{t('auth.resetPassword.newPassword')}</FieldLabel>
            <Input id="password" type="password" required minLength={8} />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">
              {t('auth.resetPassword.confirmPassword')}
            </FieldLabel>
            <Input id="confirm-password" type="password" required minLength={8} />
            <FieldDescription>{t('auth.resetPassword.passwordHint')}</FieldDescription>
          </Field>
          <Field>
            <Button type="submit" className="w-full">
              {t('auth.resetPassword.submit')}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
