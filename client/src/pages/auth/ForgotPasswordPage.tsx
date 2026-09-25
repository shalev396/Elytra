import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';
import { PageMetadata } from '@/components/shared/PageMetadata';
import { pageTitle } from '@/data/pageTitles';

export default function ForgotPasswordPage() {
  return (
    <>
      <PageMetadata title={pageTitle('Forgot Password')} noIndex />
      <ForgotPasswordForm />
    </>
  );
}
