import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ShinyText } from '@/components/animations/text/ShinyText';
import { FadeContent } from '@/components/animations/FadeContent';
import { BeamsBackground } from '@/components/animations/backgrounds/BeamsBackground';
import { app } from '@/data';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';
import { Code, Sparkles, Zap, Layers, DollarSign } from 'lucide-react';

const sectionNavItems = [
  { id: 'benefits', icon: Zap, key: 'benefits' },
  { id: 'features', icon: Sparkles, key: 'features' },
  { id: 'tech', icon: Layers, key: 'tech' },
] as const;

export function LandingHero() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <BeamsBackground className="relative">
      <section className="container mx-auto px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <FadeContent className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:px-4 sm:py-2 sm:text-sm">
            {t('landing.hero.badge')}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            {t('landing.hero.title')}{' '}
            <ShinyText className="block sm:inline">{t('landing.hero.titleHighlight')}</ShinyText>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base sm:text-lg">
            {t('landing.hero.description')}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link to={pathTo(ROUTES.AUTH.SIGNUP, language)}>{t('landing.hero.cta')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <a href={app.repoUrl} target="_blank" rel="noopener noreferrer">
                <Code className="me-2 size-4" />
                {t('landing.hero.viewGithub')}
              </a>
            </Button>
          </div>

          {/* Section Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4 sm:gap-3 sm:pt-6">
            {sectionNavItems.map(({ id, icon: Icon, key }) => (
              <button
                key={id}
                onClick={() => {
                  scrollToSection(id);
                }}
                className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground sm:px-4 sm:py-2"
              >
                <Icon className="size-3.5 sm:size-4" />
                {t(`landing.nav.${key}`)}
              </button>
            ))}
            <Link
              to={pathTo(ROUTES.PRICING, language)}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground sm:px-4 sm:py-2"
            >
              <DollarSign className="size-3.5 sm:size-4" />
              {t('landing.nav.pricing')}
            </Link>
          </div>
        </FadeContent>
      </section>
    </BeamsBackground>
  );
}
