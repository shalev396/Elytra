import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function TechCard({
  icon: Icon,
  title,
  description,
  className,
}: TechCardProps) {
  return (
    <div
      className={cn(
        "group flex flex-col items-center gap-3 rounded-xl border bg-card p-4 text-center transition-[border-color,box-shadow,transform] duration-200 hover:border-primary/50 hover:shadow-md sm:p-6",
        className
      )}
    >
      {/* Icon container - no color transition to avoid theme-switch blink */}
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105 sm:size-14">
        <Icon className="size-6 sm:size-7" />
      </div>

      {/* Text content - no transition-colors so theme change updates instantly */}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
      </div>
    </div>
  );
}
