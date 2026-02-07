import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement actual forgot password logic with Cognito
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('auth.forgotPassword.title')}</CardTitle>
          <CardDescription>{t('auth.forgotPassword.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">{t('auth.forgotPassword.email')}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.forgotPassword.emailPlaceholder')}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" className="w-full">
                  {t('auth.forgotPassword.submit')}
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
        </CardContent>
      </Card>
    </div>
  );
}
