import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <Card className={cn("group relative h-full", className)}>
      <CardContent className="flex h-full flex-col p-6 sm:p-8">
        <div className="mb-5 flex items-center">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/10 sm:size-16">
            <Icon className="size-7 sm:size-8" />
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <h3 className="mb-3 text-xl font-semibold leading-tight transition-colors duration-200 sm:text-2xl bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-primary">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
