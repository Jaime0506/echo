import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils";

const buttonVariants = tv({
  base: "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:cursor-pointer",
  variants: {
    variant: {
      default: "bg-neo-surface text-on-surface-variant neo-shadow hover:opacity-80",
      active: "bg-neo-surface text-neo-accent neo-active-glow",
      ghost: "bg-transparent text-on-surface-variant hover:bg-on-surface-variant/10",
      inset: "bg-neo-surface text-on-surface-variant neo-shadow-inset hover:opacity-80",
      // Specifically for the large central play button area
      masterPlayInner: "bg-neo-surface text-on-surface-variant neo-shadow hover:text-primary transition-colors duration-300",
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      lg: "h-11 px-8",
      icon: "h-12 w-12",
      iconSm: "h-8 w-8",
      iconLg: "h-16 w-16",
      masterPlayContainer: "h-32 w-32 md:h-48 md:w-48",
      masterPlayInner: "h-24 w-24 md:h-40 md:w-40",
    },
    loading: {
      true: "text-transparent relative pointer-events-none",
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    loading: false,
  },
});

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref" | "children">,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, loading, className }))}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        <span className={cn(loading && "opacity-0", "flex items-center justify-center w-full h-full")}>
          {children}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";
