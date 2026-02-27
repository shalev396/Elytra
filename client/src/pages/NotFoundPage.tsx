import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/shared/NavBar';
import Footer from '@/components/shared/Footer';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div className="flex min-h-svh flex-col">
      <NavBar />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">{t('notFound.title')}</h1>
          <p className="text-muted-foreground text-lg">{t('notFound.message')}</p>
          <Button asChild>
            <Link to={pathTo(ROUTES.HOME, language)}>{t('notFound.backHome')}</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
