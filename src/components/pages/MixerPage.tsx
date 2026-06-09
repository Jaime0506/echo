import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { MixerLayout } from "../templates/MixerLayout";
import { TopAppBar } from "../organisms/TopAppBar";
import { WindowBar } from "../organisms/WindowBar";
import { MixerCore, SoundChannel } from "../organisms/MixerCore";
import { MasterVolumeControl } from "../organisms/MasterVolumeControl";

export const MixerPage = () => {
  const [channels, setChannels] = useState<SoundChannel[]>([
    { id: "rain", label: "Lluvia", icon: "rain", value: 0, active: false },
    { id: "cafe", label: "Café", icon: "cafe", value: 0, active: false },
    { id: "noise", label: "Ruido Blanco", icon: "noise", value: 0, active: false },
  ]);

  const [masterVolume, setMasterVolume] = useState(0);

  // Sync initial state with backend if active
  useEffect(() => {
    channels.forEach((channel) => {
      if (channel.active && channel.value > 0) {
        invoke("set_channel_volume", { id: channel.id, volume: channel.value / 100.0 }).catch(console.error);
      }
    });
  }, []); // Run once on mount

  const updateChannelValue = (id: string, value: number) => {
    setChannels(prev => prev.map(channel => channel.id === id ? { ...channel, value, active: value > 0 } : channel));
    invoke("set_channel_volume", { id, volume: value / 100.0 }).catch(console.error);
  };

  const updateMasterVolume = (value: number) => {
    console.log('Me llamaron', value)
    setMasterVolume(value);
    invoke("set_master_volume", { volume: value / 100.0 }).catch(console.error);
  };

  return (
    <MixerLayout
      topBar={
        <>
          <WindowBar />
          <TopAppBar />
        </>
      }
      centerContent={
        <MixerCore
          channels={channels}
          onChannelChange={updateChannelValue}
          topControl={
            <MasterVolumeControl
              volume={masterVolume}
              onVolumeChange={updateMasterVolume}
            />
          }
        />
      }
    />
  );
};
