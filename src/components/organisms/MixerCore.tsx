import { Play } from "lucide-react";
import { Button } from "../ui/Button";
import { ChannelItem } from "../ui/ChannelItem";

export type SoundChannel = {
  id: string;
  label: string;
  icon: "rain" | "cafe" | "noise";
  value: number;
  active: boolean;
};

interface MixerCoreProps {
  channels: SoundChannel[];
  onChannelChange: (id: string, value: number) => void;
  topControl?: React.ReactNode;
}

export const MixerCore = ({ channels, onChannelChange, topControl }: MixerCoreProps) => {
  return (
    <div className="flex flex-col items-center gap-6 md:gap-8 w-full">
      {/* Large Play Control */}
      <Button variant="inset" size="masterPlayContainer" className="group rounded-full flex items-center justify-center p-2 md:p-4">
        <div className="w-full h-full rounded-full bg-neo-surface neo-shadow flex items-center justify-center group-hover:text-primary transition-colors duration-300">
          <Play size={48} fill="currentColor" strokeWidth={1} className="opacity-60 group-hover:opacity-100" />
        </div>
      </Button>

      {topControl}

      {/* Sound Channels */}
      <div className="flex flex-wrap gap-8 sm:gap-12 justify-center w-full mt-6 lg:mt-12">
        {channels.map((channel) => (
          <ChannelItem
            key={channel.id}
            id={channel.id}
            label={channel.label}
            iconName={channel.icon}
            value={channel.value}
            isActive={channel.active}
            onValueChange={(val) => onChannelChange(channel.id, val)}
          />
        ))}
      </div>
    </div>
  );
};
