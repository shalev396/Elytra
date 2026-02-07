import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { app, assets } from '@/data';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';

const footerLinks = [
  { to: ROUTES.LEGAL.TERMS, key: 'terms' as const },
  { to: ROUTES.LEGAL.PRIVACY, key: 'privacy' as const },
  { to: ROUTES.FEATURES, key: 'features' as const },
  { to: ROUTES.PRICING, key: 'pricing' as const },
  { to: ROUTES.DOCS, key: 'documentation' as const },
] as const;

export default function Footer() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const year = new Date().getFullYear();
  const { LogoIcon } = assets;

  return (
    <footer className="border-t border-border/60 bg-muted/30" role="contentinfo">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Mobile: stacked layout — links (two rows) → disclaimer → logo + copyright */}
        <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-6 sm:gap-y-3">
          {/* Links: wrap into rows (e.g. two rows on mobile) */}
          <nav
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center"
            aria-label="Footer"
          >
            {footerLinks.map(({ to, key }) => (
              <Link
                key={key}
                to={pathTo(to, language)}
                className="transition-colors hover:text-foreground"
              >
                {t(`footer.${key}`)}
              </Link>
            ))}
          </nav>
          {/* Disclaimer */}
          <span className="text-center">{t('footer.madeWithLove', { name: app.name })}</span>
          {/* Logo + copyright */}
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-2 sm:gap-x-6">
            <Link
              to={pathTo(ROUTES.HOME, language)}
              className="flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary"
              aria-label={t('nav.homeAria')}
            >
              <LogoIcon className="size-8 shrink-0" />
            </Link>
            <span>{t('footer.copyright', { year, name: app.name })}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
