import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement actual login logic with Cognito
    // Temporary: bypass auth and go to dashboard
    void navigate(pathTo(ROUTES.DASHBOARD, language));
  };
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('auth.login.title')}</CardTitle>
          <CardDescription>{t('auth.login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  {t('auth.login.loginWithApple')}
                </Button>
                <Button variant="outline" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {t('auth.login.loginWithGoogle')}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t('auth.login.orContinueWith')}
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">{t('auth.login.email')}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.login.emailPlaceholder')}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">{t('auth.login.password')}</FieldLabel>
                <Input id="password" type="password" required />
                <Link
                  to={pathTo(ROUTES.AUTH.FORGOT_PASSWORD, language)}
                  className="mt-1 block text-sm underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
                >
                  {t('auth.login.forgotPassword')}
                </Link>
              </Field>
              <Field>
                <Button type="submit">{t('auth.login.submit')}</Button>
                <FieldDescription className="text-center">
                  {t('auth.login.noAccount')}{' '}
                  <Link
                    to={pathTo(ROUTES.AUTH.SIGNUP, language)}
                    className="transition-colors duration-200 hover:text-primary"
                  >
                    {t('auth.login.signUp')}
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {t('auth.login.agreeTo')}{' '}
        <Link
          to={pathTo(ROUTES.LEGAL.TERMS, language)}
          className="transition-colors duration-200 hover:text-primary"
        >
          {t('auth.login.termsOfService')}
        </Link>{' '}
        {t('auth.login.and')}{' '}
        <Link
          to={pathTo(ROUTES.LEGAL.PRIVACY, language)}
          className="transition-colors duration-200 hover:text-primary"
        >
          {t('auth.login.privacyPolicy')}
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
