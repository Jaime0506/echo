import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../../utils";

const sliderVariants = tv({
  base: "relative flex touch-none select-none",
  variants: {
    orientation: {
      horizontal: "w-full items-center",
      vertical: "h-full w-full justify-center",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

const trackVariants = tv({
  base: "relative grow overflow-hidden bg-neo-surface neo-shadow-inset rounded-full",
  variants: {
    orientation: {
      horizontal: "h-2 w-full",
      vertical: "w-2 h-full", // A bit thicker for vertical or matches design
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  VariantProps<typeof sliderVariants> { }

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    orientation={orientation}
    className={cn(sliderVariants({ orientation, className }))}
    {...props}
  >
    <SliderPrimitive.Track className={trackVariants({ orientation })}>
      <SliderPrimitive.Range className="absolute bg-on-surface-variant/20 rounded-full"
        style={{
          width: "100%",
          height: "100%"
        }}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full bg-neo-surface border-[1.5px] border-on-surface-variant/20 dark:border-white/30 neo-shadow hover:neo-active-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 transition-colors cursor-pointer" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;
