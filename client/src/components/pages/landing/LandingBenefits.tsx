import { useTranslation } from 'react-i18next';
import { CardContent } from '@/components/ui/card';
import { GradientText } from '@/components/animations/text/GradientText';
import { FadeContent } from '@/components/animations/FadeContent';
import { BounceCards, BounceCard } from '@/components/ui/bounce-cards';
import {
  Accessibility,
  BookOpen,
  Braces,
  Code2,
  Download,
  Moon,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  Wallet,
  Zap,
} from 'lucide-react';

/** 12 cards: fills 2, 3 and 4 columns with no empty spaces. Keep the count a multiple of 12. */
const BENEFITS = [
  { icon: Zap, key: 'instant' },
  { icon: Search, key: 'seo' },
  { icon: Smartphone, key: 'responsive' },
  { icon: Moon, key: 'darkMode' },
  { icon: Accessibility, key: 'accessible' },
  { icon: Braces, key: 'typeSafe' },
  { icon: ShieldCheck, key: 'secure' },
  { icon: Wallet, key: 'payPerUse' },
  { icon: Rocket, key: 'onePush' },
  { icon: Download, key: 'yourData' },
  { icon: BookOpen, key: 'documented' },
  { icon: Code2, key: 'openSource' },
] as const;

export function LandingBenefits() {
  const { t } = useTranslation();

  return (
    <FadeContent>
      <section
        id="benefits"
        className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8 scroll-mt-20"
      >
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            <GradientText>{t('landing.benefits.title')}</GradientText>
          </h2>
        </div>
        <BounceCards>
          {BENEFITS.map(({ icon: Icon, key }) => (
            <BounceCard key={key}>
              <CardContent className="p-6 text-center sm:p-8">
                <Icon className="mx-auto mb-3 size-10 text-primary sm:mb-4 sm:size-12" />
                <h3 className="mb-2 text-base font-semibold sm:text-lg">
                  {t(`landing.benefits.${key}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t(`landing.benefits.${key}.description`)}
                </p>
              </CardContent>
            </BounceCard>
          ))}
        </BounceCards>
      </section>
    </FadeContent>
  );
}
