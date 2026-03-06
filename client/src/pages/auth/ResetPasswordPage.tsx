import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm';
import { PageMetadata } from '@/components/shared/PageMetadata';

export default function ResetPasswordPage() {
  return (
    <>
      <PageMetadata title="Reset Password | Elytra" noIndex />
      <ResetPasswordForm />
    </>
  );
}
