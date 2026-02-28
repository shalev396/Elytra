import { Toaster } from 'sonner';
import { useTranslation } from 'react-i18next';
import { isRTL } from '@/i18n/config';

export function DirectionalToaster() {
  const { i18n } = useTranslation();
  const position = isRTL(i18n.language) ? 'bottom-left' : 'bottom-right';

  return <Toaster position={position} richColors closeButton />;
}
