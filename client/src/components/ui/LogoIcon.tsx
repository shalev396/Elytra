import { useTheme } from "@/components/theme-context";
import { FAVICON } from "@/data/favicon";

/**
 * Renders the app logo from the same SVGs used as favicon (single source of truth).
 * Switches between favicon-light.svg and favicon-dark.svg based on theme.
 */
export function LogoIcon({ className }: { className?: string }) {
  const { theme } = useTheme();
  const src = theme === "dark" ? FAVICON.dark : FAVICON.light;
  return (
    <img
      src={src}
      alt=""
      className={className}
      width={24}
      height={24}
    />
  );
}
