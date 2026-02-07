import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { pathTo, ROUTES } from "@/router/routes";
import { FadeContent } from "@/components/animations/FadeContent";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  const { lng } = useParams<{ lng: string }>();
  const language = lng ?? "en";
  const sections = [
    "section1",
    "section2",
    "section3",
    "section4",
    "section5",
    "section6",
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{t("legal.privacy.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("legal.privacy.lastUpdated")}
        </p>
      </CardHeader>
      <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
        <Separator className="my-6" />

        {sections.map((section, index) => (
          <FadeContent key={section} delay={index * 100}>
            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">
                {t(`legal.privacy.${section}.title`)}
              </h2>
              <p className="mb-4">{t(`legal.privacy.${section}.content`)}</p>
            </section>
          </FadeContent>
        ))}

        <Separator className="my-6" />

        <div className="text-center">
          <Link to={pathTo(ROUTES.LEGAL.TERMS, language)} className="text-sm hover:underline">
            {t("footer.terms")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
