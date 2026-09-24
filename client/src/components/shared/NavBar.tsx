import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { app, assets } from '@/data';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { UserMenu } from '@/components/shared/UserMenu';
import { selectIsAuthenticated } from '@/store/userSlice';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';

export default function NavBar() {
  const { t } = useTranslation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { language } = useLanguage();
  const { LogoIcon } = assets;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          to={pathTo(ROUTES.HOME, language)}
          className="flex min-w-0 shrink items-center gap-2 font-semibold transition-colors duration-200 hover:text-primary"
          aria-label={t('nav.homeAria')}
        >
          <LogoIcon className="size-8 shrink-0" />
          <span className="truncate text-lg sm:text-xl">{app.name}</span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button asChild size="sm">
              <Link to={pathTo(ROUTES.AUTH.SIGNUP, language)}>{t('nav.getStarted')}</Link>
            </Button>
          )}
          <div className="flex items-center gap-1 sm:ms-1">
            <LanguageSwitcher />
            <ModeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
