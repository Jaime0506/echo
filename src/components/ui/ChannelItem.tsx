import React from "react";
import { Slider } from "./Slider";
import { Typography } from "./Typography";
import { Button } from "./Button";
import { CloudRain, Wind } from "lucide-react";
import { cn } from "../../utils";

interface ChannelItemProps {
  id: string;
  label: string;
  iconName: string;
  isActive?: boolean;
  value: number;
  onValueChange: (value: number) => void;
  className?: string;
}

export const ChannelItem: React.FC<ChannelItemProps> = ({
  label,
  iconName,
  isActive = false,
  value,
  onValueChange,
  className
}) => {
  const renderIcon = () => {
    switch (iconName) {
      case "rain":
        return <CloudRain size={24} strokeWidth={1.5} />;
      case "wind":
        return <Wind size={24} strokeWidth={1.5} />;
      default:
        return <CloudRain size={24} strokeWidth={1.5} />;
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-3 md:gap-4 w-20 sm:w-24", className)}>
      <Button
        variant={isActive ? "active" : "default"}
        size="iconLg"
        className={cn(
          "rounded-full",
          !isActive && "text-on-surface-variant opacity-80"
        )}
      >
        {renderIcon()}
      </Button>

      <div className="h-40 sm:h-48 flex items-center justify-center w-full py-2">
        <Slider
          orientation="vertical"
          value={[value]}
          onValueChange={(vals) => onValueChange(vals[0])}
          max={100}
          min={0}
          className="h-full"
        />
      </div>

      <Typography
        variant="label"
        color={isActive ? "accent" : "muted"}
        className="mt-3 md:mt-4 text-center"
      >
        {label}
      </Typography>
    </div>
  );
};
