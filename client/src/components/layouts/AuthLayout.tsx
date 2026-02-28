import { Outlet } from 'react-router-dom';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import NavBar from '@/components/shared/NavBar';
import Footer from '@/components/shared/Footer';
import { app } from '@/data';
import { pathTo, ROUTES } from '@/router/routes';

export function AuthLayout() {
  const { t } = useTranslation();
  const { lng } = useParams<{ lng: string }>();
  const language = lng ?? 'en';

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 pt-24">
        <div className="w-full max-w-5xl">
          <Card className="overflow-hidden border-border/50 shadow-2xl p-0">
            <div className="grid md:grid-cols-2 min-h-112">
              {/* Left - Form content */}
              <div className="p-6 md:p-10 space-y-6">
                <Outlet />
              </div>

              {/* Right - Branded panel (desktop) */}
              <div className="relative hidden md:flex bg-linear-to-br from-gradient-from via-gradient-via to-gradient-deep overflow-hidden">
                <div className="absolute inset-0 transition-transform duration-1000 hover:scale-110">
                  <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
                  <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-from rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
                  <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
                </div>
                <div className="relative flex flex-col items-center justify-center p-10 text-on-gradient w-full">
                  <div className="space-y-6 text-center">
                    <div className="space-y-2 transform transition-transform hover:scale-105 duration-300">
                      <h2 className="text-5xl font-bold tracking-tight">{app.name}</h2>
                      <p className="text-xl text-on-gradient-muted">
                        {t('auth.branded.description')}
                      </p>
                    </div>
                    <div className="mt-12 space-y-4 text-left max-w-md mx-auto">
                      <div className="flex items-start gap-3 group">
                        <div className="shrink-0 w-2 h-2 rounded-full bg-on-gradient mt-2 group-hover:scale-150 transition-transform duration-300" />
                        <p className="text-on-gradient-muted group-hover:text-on-gradient transition-colors">
                          {t('auth.login.feature1')}
                        </p>
                      </div>
                      <div className="flex items-start gap-3 group">
                        <div className="shrink-0 w-2 h-2 rounded-full bg-on-gradient mt-2 group-hover:scale-150 transition-transform duration-300" />
                        <p className="text-on-gradient-muted group-hover:text-on-gradient transition-colors">
                          {t('auth.login.feature2')}
                        </p>
                      </div>
                      <div className="flex items-start gap-3 group">
                        <div className="shrink-0 w-2 h-2 rounded-full bg-on-gradient mt-2 group-hover:scale-150 transition-transform duration-300" />
                        <p className="text-on-gradient-muted group-hover:text-on-gradient transition-colors">
                          {t('auth.login.feature3')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Terms & Privacy - Below Card */}
          <p className="mt-6 text-center text-xs text-muted-foreground px-6">
            {t('auth.login.agreeTo')}{' '}
            <Link
              to={pathTo(ROUTES.LEGAL.TERMS, language)}
              className="text-primary underline underline-offset-4 hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              {t('auth.login.termsOfService')}
            </Link>{' '}
            {t('auth.login.and')}{' '}
            <Link
              to={pathTo(ROUTES.LEGAL.PRIVACY, language)}
              className="text-primary underline underline-offset-4 hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              {t('auth.login.privacyPolicy')}
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
