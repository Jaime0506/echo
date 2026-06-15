import { Pause, Play } from "lucide-react";
import { Button } from "../ui/Button";
import { ChannelItem } from "../ui/ChannelItem";
import type { SoundChannel } from "../../types/core";

interface MixerCoreProps {
  channels: SoundChannel[];
  onChannelChange: (id: string, value: number) => void;
  topControl?: React.ReactNode;
  isPaused: boolean;
  onPressPlayControl: () => void;
}

export const MixerCore = ({ channels, onChannelChange, topControl, isPaused, onPressPlayControl }: MixerCoreProps) => {
  return (
    <div className="flex flex-col items-center gap-6 md:gap-8 w-full">
      {/* Large Play Control */}
      <Button variant="inset" size="masterPlayContainer" className="group rounded-full flex items-center justify-center p-2 md:p-4" onClick={onPressPlayControl}>
        <div className="w-full h-full rounded-full bg-neo-surface neo-shadow flex items-center justify-center group-hover:text-neo-accent transition-colors duration-300">
          {isPaused ? <Play size={48} fill="currentColor" strokeWidth={1} className="opacity-80 group-hover:opacity-100" /> : <Pause size={48} fill="currentColor" strokeWidth={1} className="opacity-80 group-hover:opacity-100" />}
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
