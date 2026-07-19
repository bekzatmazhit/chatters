import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill px-2 py-0.5 text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
  {
    variants: {
      variant: {
        success: "bg-success-bg text-success border border-success/20",
        danger: "bg-danger-bg text-danger border border-danger/20",
        neutral: "bg-surface-hover text-content-primary border border-border",
        accent: "bg-accent/10 text-accent border border-accent/20",
        // Fallbacks
        default: "bg-surface-hover text-content-primary border border-border",
        destructive: "bg-danger-bg text-danger border border-danger/20",
        secondary: "bg-surface-hover text-content-primary border border-border",
        outline: "text-content-primary border border-border",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
