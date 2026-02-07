import { useSelector } from "react-redux";
import { selectIsGlobalLoading } from "@/store/uiSlice";

export function GlobalLoading() {
  const isLoading = useSelector(selectIsGlobalLoading);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="alert"
      aria-live="assertive"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="size-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
