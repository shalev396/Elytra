import { useTranslation } from 'react-i18next';
import { app } from '@/data';

export default function DocsPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">{t('footer.documentation')}</h1>
      <p className="text-muted-foreground mt-2">{app.name} documentation. Content coming soon.</p>
    </div>
  );
}
