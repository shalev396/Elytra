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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GradientText } from "@/components/animations/text/GradientText";
import { FadeContent } from "@/components/animations/FadeContent";
import { FeatureCard } from "@/components/pages/landing/FeatureCard";

const FEATURES: { icon: LucideIcon; slug: string }[] = [
  { icon: Lock, slug: "auth" },
  { icon: Cloud, slug: "s3" },
  { icon: Server, slug: "serverless" },
  { icon: Shield, slug: "cicd" },
  { icon: Database, slug: "state" },
  { icon: Globe, slug: "i18n" },
  { icon: Mail, slug: "email" },
  { icon: ShieldCheck, slug: "mfa" },
  { icon: BarChart3, slug: "monitoring" },
];

export function LandingFeatures() {
  const { t } = useTranslation();

  return (
    <FadeContent delay={200}>
      <section className="container mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {t("landing.features.title")}{" "}
            <GradientText>{t("landing.features.titleHighlight")}</GradientText>
          </h2>
          <p className="text-muted-foreground mt-3 text-base sm:mt-4 sm:text-lg">
            {t("landing.features.subtitle")}
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.slug}
              icon={feature.icon}
              title={t(`landing.features.${feature.slug}.title`)}
              description={t(`landing.features.${feature.slug}.description`)}
            />
          ))}
        </div>
      </section>
    </FadeContent>
  );
}
