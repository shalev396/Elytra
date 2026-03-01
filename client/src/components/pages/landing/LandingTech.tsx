import type { LucideIcon } from 'lucide-react';
import {
  Code2,
  FileCode,
  Zap,
  Paintbrush,
  Layout,
  Sparkles,
  FunctionSquare,
  Database,
  RefreshCw,
  Globe,
  Server,
  Cloud,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GradientText } from '@/components/animations/text/GradientText';
import { FadeContent } from '@/components/animations/FadeContent';
import { TechCard } from '@/components/pages/landing/TechCard';

const TECHNOLOGIES: { slug: string; url: string; icon: LucideIcon }[] = [
  { slug: 'react', url: 'https://react.dev', icon: Code2 },
  { slug: 'typescript', url: 'https://www.typescriptlang.org', icon: FileCode },
  { slug: 'vite', url: 'https://vitejs.dev', icon: Zap },
  { slug: 'tailwind', url: 'https://tailwindcss.com', icon: Paintbrush },
  { slug: 'shadcn', url: 'https://ui.shadcn.com', icon: Layout },
  { slug: 'reactBits', url: 'https://reactbits.dev', icon: Sparkles },
  { slug: 'lambda', url: 'https://aws.amazon.com/lambda', icon: FunctionSquare },
  { slug: 'redux', url: 'https://redux-toolkit.js.org', icon: Database },
  { slug: 'query', url: 'https://tanstack.com/query', icon: RefreshCw },
  { slug: 'axios', url: 'https://axios-http.com', icon: Globe },
  { slug: 'serverless', url: 'https://www.serverless.com', icon: Server },
  { slug: 'aws', url: 'https://aws.amazon.com', icon: Cloud },
];

export function LandingTech() {
  const { t } = useTranslation();

  return (
    <FadeContent delay={400}>
      <section
        id="tech"
        className="container mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 scroll-mt-20"
      >
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {t('landing.tech.title')}{' '}
            <GradientText>{t('landing.tech.titleHighlight')}</GradientText>
          </h2>
          <p className="text-muted-foreground mt-3 text-base sm:mt-4 sm:text-lg">
            {t('landing.tech.subtitle')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {TECHNOLOGIES.map((tech) => (
            <a
              key={tech.slug}
              href={tech.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <TechCard
                icon={tech.icon}
                title={t(`landing.tech.${tech.slug}.name`)}
                description={t(`landing.tech.${tech.slug}.description`)}
              />
            </a>
          ))}
        </div>
      </section>
    </FadeContent>
  );
}
