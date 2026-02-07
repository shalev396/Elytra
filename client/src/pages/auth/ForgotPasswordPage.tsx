import { useTranslation } from 'react-i18next';
import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('auth.forgotPassword.title')}
        </h1>
        <p className="text-muted-foreground text-balance">{t('auth.forgotPassword.description')}</p>
      </div>
      <ForgotPasswordForm />
    </>
  );
}
