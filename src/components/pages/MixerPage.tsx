import { MixerLayout } from "../templates/MixerLayout";
import { TopAppBar } from "../organisms/TopAppBar";
import { WindowBar } from "../organisms/WindowBar";
import { MixerCore } from "../organisms/MixerCore";
import { MasterVolumeControl } from "../organisms/MasterVolumeControl";
import { useAudioMixer } from "../../hooks/useAudioMixer";

export const MixerPage = () => {
  const {
    channels,
    masterVolume,
    isLoading: isLoadingAllSettings,
    updateChannelValue,
    updateMasterVolume,

    isPaused,
    onPressPlayControl,
  } = useAudioMixer();

  if (isLoadingAllSettings) {
    return (
      <div className="w-screen h-screen flex items-center justify-center text-4xl dark:text-neutral-300 text-neutral-600">Cargando...</div>
    )
  }

  console.log('playPause ', isPaused)

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
          isPaused={isPaused}
          onPressPlayControl={onPressPlayControl}
        />
      }
    />
  );
};
