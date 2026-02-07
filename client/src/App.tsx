import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRouter from "@/router";
import { GlobalLoading } from "@/components/shared/GlobalLoading";
import { loadFromStorage } from "@/store/userSlice";
import type { AppDispatch } from "@/store";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {
  const dispatch = useDispatch<AppDispatch>();

  // Load user from storage on app mount
  useEffect(() => {
    dispatch(loadFromStorage());
  }, [dispatch]);

  return (
    <ThemeProvider storageKey="elytra-ui-theme">
      <GlobalLoading />
      <AppRouter />
    </ThemeProvider>
  );
}
