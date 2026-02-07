import { lazy } from "react";
import { Route } from "react-router-dom";
import { DocLayout } from "@/components/layouts/DocLayout";
import { ROUTES } from "@/router/routes";

const PrivacyPolicyPage = lazy(() => import("@/pages/legal/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(
  () => import("@/pages/legal/TermsOfServicePage"),
);

export const legalRoutes = (
  <Route path={ROUTES.LEGAL.BASE} element={<DocLayout />}>
    <Route path={ROUTES.LEGAL.SEGMENTS.PRIVACY} element={<PrivacyPolicyPage />} />
    <Route path={ROUTES.LEGAL.SEGMENTS.TERMS} element={<TermsOfServicePage />} />
  </Route>
);
