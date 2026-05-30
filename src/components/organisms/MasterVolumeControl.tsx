import { Slider } from "../ui/Slider";
import { Typography } from "../ui/Typography";

interface MasterVolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const MasterVolumeControl = ({ volume, onVolumeChange }: MasterVolumeControlProps) => {
  return (
    <div className="w-1/4 md:w-1/3 lg:w-1/2 flex flex-col gap-2 md:gap-4 items-center justify-center px-2 md:px-4 lg:px-0 mt-2 md:mt-4">
      <Slider
        orientation="horizontal"
        value={[volume]}
        onValueChange={(v) => onVolumeChange(v[0])}
        max={100}
      />
      <Typography variant="mono" color="default">
        VOL {volume}%
      </Typography>
    </div>
  );
};
