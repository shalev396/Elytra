import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { pathTo, ROUTES } from "@/router/routes";
import { useLanguage } from "@/hooks/useLanguage";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement actual signup logic with Cognito
    console.log("Signup form submitted");
    // Temporary: bypass auth and go to dashboard
    navigate(pathTo(ROUTES.DASHBOARD, language));
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("auth.signUp.title")}</CardTitle>
          <CardDescription>{t("auth.signUp.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">{t("auth.signUp.fullName")}</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("auth.signUp.namePlaceholder")}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">{t("auth.signUp.email")}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.signUp.emailPlaceholder")}
                  required
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">
                      {t("auth.signUp.password")}
                    </FieldLabel>
                    <Input id="password" type="password" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      {t("auth.signUp.confirmPassword")}
                    </FieldLabel>
                    <Input id="confirm-password" type="password" required />
                  </Field>
                </Field>
                <FieldDescription>
                  {t("auth.signUp.passwordHint")}
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit">{t("auth.signUp.submit")}</Button>
                <FieldDescription className="text-center">
                  {t("auth.signUp.haveAccount")}{" "}
                  <Link
                    to={pathTo(ROUTES.AUTH.LOGIN, language)}
                    className="transition-colors duration-200 hover:text-primary"
                  >
                    {t("auth.signUp.signIn")}
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {t("auth.signUp.agreeTo")}{" "}
        <Link
          to={pathTo(ROUTES.LEGAL.TERMS, language)}
          className="transition-colors duration-200 hover:text-primary"
        >
          {t("auth.signUp.termsOfService")}
        </Link>{" "}
        {t("auth.signUp.and")}{" "}
        <Link
          to={pathTo(ROUTES.LEGAL.PRIVACY, language)}
          className="transition-colors duration-200 hover:text-primary"
        >
          {t("auth.signUp.privacyPolicy")}
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
