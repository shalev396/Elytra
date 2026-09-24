import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';
import { PageMetadata } from '@/components/shared/PageMetadata';
import { pageTitle } from '@/data/pageTitles';

export default function ResetPasswordPage() {
  return (
    <>
      <PageMetadata title={pageTitle('Reset Password')} noIndex />
      <ResetPasswordForm />
    </>
  );
}
