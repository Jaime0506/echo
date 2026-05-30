import { Slider } from "../ui/Slider";
import { Typography } from "../ui/Typography";

interface MasterVolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const MasterVolumeControl = ({ volume, onVolumeChange }: MasterVolumeControlProps) => {
  return (
    <div className="w-1/2 flex flex-col gap-2 items-center justify-center lg:items-start px-4 lg:px-0">
      <Slider
        orientation="horizontal"
        value={[volume]}
        onValueChange={(v) => onVolumeChange(v[0])}
        max={100}
      />
      <Typography variant="mono" color="muted">
        VOL {volume}%
      </Typography>
    </div>
  );
};
