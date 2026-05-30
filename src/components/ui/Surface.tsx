import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../../utils";

const surfaceVariants = tv({
  base: "transition-all duration-300",
  variants: {
    variant: {
      default: "bg-neo-surface text-on-surface-variant",
      card: "bg-neo-surface text-on-surface-variant rounded-xl",
      mixer: "bg-neo-surface text-on-surface-variant rounded-[2rem]",
    },
    elevation: {
      flat: "",
      raised: "neo-shadow",
      raisedSm: "neo-shadow-sm",
      sunken: "neo-shadow-inset",
      sunkenSm: "neo-shadow-inset-sm",
      active: "neo-active-glow",
    },
  },
  defaultVariants: {
    variant: "default",
    elevation: "flat",
  },
});

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {
  as?: React.ElementType;
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant, elevation, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(surfaceVariants({ variant, elevation, className }))}
        {...props}
      />
    );
  }
);

Surface.displayName = "Surface";
