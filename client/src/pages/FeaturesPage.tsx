import { Link } from 'react-router-dom';
import {
  Lock,
  Cloud,
  Server,
  Shield,
  Database,
  Globe,
  Mail,
  ShieldCheck,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GradientText } from '@/components/animations/text/GradientText';
import { FadeContent } from '@/components/animations/FadeContent';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';

const FEATURES: { icon: LucideIcon; slug: string }[] = [
  { icon: Lock, slug: 'auth' },
  { icon: Cloud, slug: 's3' },
  { icon: Server, slug: 'serverless' },
  { icon: Shield, slug: 'cicd' },
  { icon: Database, slug: 'state' },
  { icon: Globe, slug: 'i18n' },
  { icon: Mail, slug: 'email' },
  { icon: ShieldCheck, slug: 'mfa' },
  { icon: BarChart3, slug: 'monitoring' },
];

export default function FeaturesPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div className="min-h-svh">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 pt-24 pb-16 sm:px-6 lg:px-8">
          <FadeContent>
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <GradientText>{t('featuresPage.title')}</GradientText>{' '}
                {t('featuresPage.titleHighlight')}
              </h1>
              <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg sm:text-xl">
                {t('featuresPage.subtitle')}
              </p>
            </div>
          </FadeContent>
        </div>
      </div>

      {/* Features grid */}
      <div className="container mx-auto px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <FadeContent key={feature.slug} delay={index * 80}>
              <SpotlightCard className="h-full bg-card">
                <div className="flex h-full flex-col p-6 sm:p-8">
                  <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-14">
                    <feature.icon className="size-6 sm:size-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold sm:text-xl">
                    {t(`landing.features.${feature.slug}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {t(`landing.features.${feature.slug}.description`)}
                  </p>
                </div>
              </SpotlightCard>
            </FadeContent>
          ))}
        </div>

        {/* CTA */}
        <FadeContent delay={600}>
          <div className="mt-20 text-center">
            <SpotlightCard className="mx-auto max-w-2xl bg-muted">
              <div className="p-8 sm:p-10">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {t('landing.cta.title')}{' '}
                  <GradientText>{t('landing.cta.titleHighlight')}</GradientText>
                </h2>
                <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-base">
                  {t('landing.cta.description')}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                  <Button size="lg" variant="gradient" asChild>
                    <Link to={pathTo(ROUTES.AUTH.SIGNUP, language)}>
                      {t('landing.cta.button')}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to={pathTo(ROUTES.DOCS, language)}>{t('landing.cta.docs')}</Link>
                  </Button>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </FadeContent>
      </div>
    </div>
  );
}
