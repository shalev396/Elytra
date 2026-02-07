import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('auth.resetPassword.title')}</CardTitle>
          <CardDescription>{t('auth.resetPassword.description')}</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
