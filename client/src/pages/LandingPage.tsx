import { Separator } from '@/components/ui/separator';
import { LandingHero } from '@/components/pages/landing/LandingHero';
import { LandingBenefits } from '@/components/pages/landing/LandingBenefits';
import { LandingFeatures } from '@/components/pages/landing/LandingFeatures';
import { LandingTech } from '@/components/pages/landing/LandingTech';
import { LandingCta } from '@/components/pages/landing/LandingCta';

export default function LandingPage() {
  return (
    <main className="min-h-svh min-w-[320px]">
      <LandingHero />

      <Separator className="container mx-auto" />

      <LandingBenefits />

      <Separator className="container mx-auto" />

      <LandingFeatures />

      <Separator className="container mx-auto" />

      <LandingTech />

      <Separator className="container mx-auto" />

      <LandingCta />
    </main>
  );
}
