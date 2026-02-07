import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientText } from '@/components/animations/text/GradientText';
import { FadeContent } from '@/components/animations/FadeContent';
import { ElectricBorder } from '@/components/animations/ElectricBorder';
import { Check } from 'lucide-react';
import { pathTo, ROUTES } from '@/router/routes';
import { useLanguage } from '@/hooks/useLanguage';

export default function PricingPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const plans = ['free', 'pro', 'enterprise'] as const;

  return (
    <div className="min-h-svh">
      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <FadeContent>
          <div className="mb-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <GradientText>{t('pricing.title')}</GradientText> {t('pricing.titleHighlight')}
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
              {t('pricing.subtitle')}
            </p>
          </div>
        </FadeContent>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((planKey, index) => {
            const isPro = planKey === 'pro';

            return (
              <FadeContent key={planKey} delay={index * 100}>
                {isPro ? (
                  <ElectricBorder className="relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground rounded-full px-4 py-1 text-sm font-medium">
                        {t(`pricing.${planKey}.badge`)}
                      </span>
                    </div>
                    <Card>
                      <CardHeader className="text-center">
                        <CardTitle className="text-2xl">{t(`pricing.${planKey}.name`)}</CardTitle>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">
                            {t(`pricing.${planKey}.price`)}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            /{t(`pricing.${planKey}.period`)}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-2 text-sm">
                          {t(`pricing.${planKey}.description`)}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {(
                            t(`pricing.${planKey}.features`, {
                              returnObjects: true,
                            }) as string[]
                          ).map((feature) => (
                            <li key={feature} className="flex items-start gap-3">
                              <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button className="mt-6 w-full" asChild>
                          <Link to={pathTo(ROUTES.AUTH.SIGNUP, language)}>
                            {t(`pricing.${planKey}.cta`)}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </ElectricBorder>
                ) : (
                  <Card className="relative">
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">{t(`pricing.${planKey}.name`)}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">{t(`pricing.${planKey}.price`)}</span>
                        <span className="text-muted-foreground text-sm">
                          /{t(`pricing.${planKey}.period`)}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-2 text-sm">
                        {t(`pricing.${planKey}.description`)}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {(
                          t(`pricing.${planKey}.features`, {
                            returnObjects: true,
                          }) as string[]
                        ).map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="mt-6 w-full" variant="outline" asChild>
                        <Link to={pathTo(ROUTES.AUTH.SIGNUP, language)}>
                          {t(`pricing.${planKey}.cta`)}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </FadeContent>
            );
          })}
        </div>
      </div>
    </div>
  );
}
