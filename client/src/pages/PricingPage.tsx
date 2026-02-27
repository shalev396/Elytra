import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientText } from '@/components/animations/text/GradientText';
import { FadeContent } from '@/components/animations/FadeContent';
import { ElectricBorder } from '@/components/animations/ElectricBorder';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Check, ArrowRight } from 'lucide-react';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';

type BillingCycle = 'monthly' | 'yearly';

export default function PricingPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [billing, setBilling] = useState<BillingCycle>('monthly');

  const plans = ['free', 'pro', 'enterprise'] as const;

  const faqItems = t('pricing.faq.items', { returnObjects: true }) as {
    question: string;
    answer: string;
  }[];

  return (
    <div className="min-h-svh">
      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeContent>
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <GradientText>{t('pricing.title')}</GradientText> {t('pricing.titleHighlight')}
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
              {t('pricing.subtitle')}
            </p>
          </div>
        </FadeContent>

        {/* Billing toggle */}
        <FadeContent delay={100}>
          <div className="mb-14 flex items-center justify-center gap-3">
            <button
              onClick={() => { setBilling('monthly'); }}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                billing === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => { setBilling('yearly'); }}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                billing === 'yearly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('pricing.yearly')}
            </button>
            {billing === 'yearly' && (
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                {t('pricing.yearlyDiscount')}
              </span>
            )}
          </div>
        </FadeContent>

        {/* Pricing cards */}
        <div className="mx-auto grid max-w-5xl items-stretch gap-8 lg:grid-cols-3">
          {plans.map((planKey, index) => {
            const isPro = planKey === 'pro';
            const features = t(`pricing.${planKey}.features`, {
              returnObjects: true,
            }) as string[];
            const badge = t(`pricing.${planKey}.badge`);
            const price =
              billing === 'yearly'
                ? t(`pricing.${planKey}.priceYearly`)
                : t(`pricing.${planKey}.price`);
            const period =
              billing === 'yearly'
                ? t(`pricing.${planKey}.periodYearly`)
                : t(`pricing.${planKey}.period`);

            const inner = (
              <div className="flex h-full flex-col">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{t(`pricing.${planKey}.name`)}</CardTitle>
                  <div className="mt-4">
                    <span className="whitespace-pre-line text-4xl font-bold">{price}</span>
                    <span className="text-muted-foreground text-sm">/{period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2 text-base">
                    {t(`pricing.${planKey}.description`)}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col pt-2">
                  <ul className="flex-1 space-y-3">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-8 w-full"
                    variant={isPro ? 'gradient' : 'outline'}
                    asChild
                  >
                    <Link to={pathTo(ROUTES.AUTH.SIGNUP, language)}>
                      {t(`pricing.${planKey}.cta`)}
                    </Link>
                  </Button>
                </CardContent>
              </div>
            );

            return (
              <FadeContent key={planKey} delay={index * 100}>
                {isPro ? (
                  <div className="relative">
                    {badge && (
                      <div className="absolute -top-3 start-1/2 z-10 -translate-x-1/2 rtl:translate-x-1/2">
                        <span className="bg-primary text-primary-foreground rounded-full px-4 py-1 text-sm font-medium shadow-lg">
                          {badge}
                        </span>
                      </div>
                    )}
                    <ElectricBorder className="h-full">
                      <Card className="h-full border-0 bg-transparent shadow-none">
                        {inner}
                      </Card>
                    </ElectricBorder>
                  </div>
                ) : (
                  <Card className="h-full">{inner}</Card>
                )}
              </FadeContent>
            );
          })}
        </div>

        {/* FAQ */}
        <FadeContent delay={400}>
          <div className="mx-auto mt-24 max-w-3xl">
            <h2 className="mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl">
              {t('pricing.faq.title')}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-start text-base">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </FadeContent>

        {/* Bottom CTA */}
        <FadeContent delay={600}>
          <div className="mt-24 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t('pricing.ctaSection.title')}
            </h2>
            <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-base">
              {t('pricing.ctaSection.description')}
            </p>
            <div className="mt-6">
              <Button size="lg" variant="gradient" asChild>
                <Link to={pathTo(ROUTES.AUTH.SIGNUP, language)}>
                  {t('pricing.ctaSection.button')}
                  <ArrowRight className="ms-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </FadeContent>
      </div>
    </div>
  );
}
