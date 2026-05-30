import { useState, useEffect } from "react";
import { MixerLayout } from "../templates/MixerLayout";
import { TopAppBar } from "../organisms/TopAppBar";
import { MixerCore, SoundChannel } from "../organisms/MixerCore";
import { MasterVolumeControl } from "../organisms/MasterVolumeControl";

export const MixerPage = () => {
  const [channels, setChannels] = useState<SoundChannel[]>([
    { id: "rain", label: "Lluvia", icon: "rain", value: 20, active: false },
    { id: "cafe", label: "Café", icon: "cafe", value: 75, active: false },
    { id: "noise", label: "Ruido Blanco", icon: "noise", value: 40, active: false },
  ]);

  const [masterVolume, setMasterVolume] = useState(33);

  useEffect(() => {
    const handleResize = () => {
      console.log(`Window size: ${window.innerWidth}px x ${window.innerHeight}px`);
    };
    
    // Log initial size
    handleResize();
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateChannelValue = (id: string, value: number) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, value } : c));
  };

  return (
    <MixerLayout
      topBar={<TopAppBar />}
      centerContent={
        <MixerCore
          channels={channels}
          onChannelChange={updateChannelValue}
          topControl={
            <MasterVolumeControl
              volume={masterVolume}
              onVolumeChange={setMasterVolume}
            />
          }
        />
      }
    />
  );
};
