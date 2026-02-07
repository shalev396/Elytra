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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GradientText } from '@/components/animations/text/GradientText';
import { FadeContent } from '@/components/animations/FadeContent';
import { FeatureCard } from '@/components/pages/landing/FeatureCard';
import { useTranslation } from 'react-i18next';

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

  return (
    <div className="min-h-svh">
      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <FadeContent>
          <div className="mb-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <GradientText>{t('featuresPage.title')}</GradientText>{' '}
              {t('featuresPage.titleHighlight')}
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
              {t('featuresPage.subtitle')}
            </p>
          </div>
        </FadeContent>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <FadeContent key={feature.slug} delay={index * 100}>
              <FeatureCard
                icon={feature.icon}
                title={t(`landing.features.${feature.slug}.title`)}
                description={t(`landing.features.${feature.slug}.description`)}
              />
            </FadeContent>
          ))}
        </div>

        <FadeContent delay={600}>
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t('featuresPage.comingSoon')}</h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
              {t('featuresPage.comingSoonDesc')}
            </p>
          </div>
        </FadeContent>
      </div>
    </div>
  );
}
