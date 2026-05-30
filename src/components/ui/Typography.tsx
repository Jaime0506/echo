import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../../utils";

const typographyVariants = tv({
  base: "text-on-surface-variant m-0",
  variants: {
    variant: {
      display: "font-[var(--font-display-lg)] text-[length:var(--text-display-lg)] leading-[var(--text-display-lg--line-height)] tracking-[var(--text-display-lg--letter-spacing)] font-semibold",
      headline: "font-[var(--font-headline-md)] text-[length:var(--text-headline-md)] leading-[var(--text-headline-md--line-height)] tracking-[var(--text-headline-md--letter-spacing)] font-medium",
      body: "font-[var(--font-body-md)] text-[length:var(--text-body-md)] leading-[var(--text-body-md--line-height)] font-normal",
      label: "font-[var(--font-label-caps)] text-[length:var(--text-label-caps)] leading-[var(--text-label-caps--line-height)] tracking-[var(--text-label-caps--letter-spacing)] font-semibold uppercase",
      mono: "font-[var(--font-mono-value)] text-[length:var(--text-mono-value)] leading-[var(--text-mono-value--line-height)] tracking-[var(--text-mono-value--letter-spacing)] font-medium",
    },
    color: {
      default: "text-on-surface-variant",
      muted: "text-on-surface-variant opacity-60",
      accent: "text-neo-accent",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "default",
  },
});

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement | HTMLSpanElement>, "color">,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, color, as, ...props }, ref) => {
    // Determine default element based on variant if not provided
    const defaultAs =
      variant === "display" ? "h1" :
      variant === "headline" ? "h2" :
      variant === "label" || variant === "mono" ? "span" : "p";
      
    const Component = as || defaultAs;

    return (
      <Component
        ref={ref as React.Ref<HTMLElement>}
        className={cn(typographyVariants({ variant, color, className }))}
        {...props}
      />
    );
  }
);

Typography.displayName = "Typography";
