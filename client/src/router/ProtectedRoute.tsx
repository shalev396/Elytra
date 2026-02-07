import { useParams, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/userSlice";
import { pathTo, ROUTES } from "@/router/routes";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

/**
 * Wraps route content and redirects to login when the user is not authenticated.
 * Use as the element of any Route that should be guarded:
 *
 *   <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
 *     ...
 *   </Route>
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { lng } = useParams<{ lng: string }>();
  const language = lng ?? "en";

  if (!isAuthenticated) {
    return <Navigate to={pathTo(ROUTES.AUTH.LOGIN, language)} replace />;
  }

  return <>{children}</>;
}
