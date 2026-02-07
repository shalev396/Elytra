import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { pathTo, ROUTES } from "@/router/routes";
import { useLanguage } from "@/hooks/useLanguage";

export default function ConfirmSignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code) {
      setTimeout(() => {
        navigate(pathTo(ROUTES.AUTH.LOGIN, language));
      }, 2000);
    }
  }, [code, language, navigate]);

  return (
    <>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t("auth.confirm.title")}
        </h1>
        <p className="text-muted-foreground text-balance">
          {code ? t("auth.confirm.checking") : t("auth.confirm.checkEmail")}
        </p>
      </div>
      <div className="space-y-4 text-center">
        {!code && (
          <>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a confirmation link to your email address. Please
              click the link to verify your account.
            </p>
            <Button asChild>
              <Link to={pathTo(ROUTES.AUTH.LOGIN, language)}>
                {t("auth.confirm.goToLogin")}
              </Link>
            </Button>
          </>
        )}
      </div>
    </>
  );
}
