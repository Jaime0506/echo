import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SoundChannel } from "../components/organisms/MixerCore";
import { store } from "../store/store";

export const useAudioMixer = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [channels, setChannels] = useState<SoundChannel[]>([
        { id: "rain", label: "Lluvia", icon: "rain", value: 0, active: false },
        { id: "cafe", label: "Café", icon: "cafe", value: 0, active: false },
        {
            id: "noise",
            label: "Ruido Blanco",
            icon: "noise",
            value: 0,
            active: false,
        },
    ]);

    const [masterVolume, setMasterVolume] = useState(0);

    const updateChannelValue = (id: string, value: number) => {
        setChannels((prev) =>
            prev.map((channel) =>
                channel.id === id
                    ? { ...channel, value, active: value > 0 }
                    : channel,
            ),
        );
        invoke("set_channel_volume", { id, volume: value / 100.0 }).catch(
            console.error,
        );

        store.set(
            "channels",
            channels.map((channel) =>
                channel.id === id
                    ? { ...channel, value, active: value > 0 }
                    : channel,
            ),
        );
    };

    const updateMasterVolume = (value: number) => {
        setMasterVolume(value);
        invoke("set_master_volume", { volume: value / 100.0 }).catch(
            console.error,
        );

        store.set("masterVolume", value);
    };

    const handleGetAllSettings = async () => {
        try {
            // Hacemos las peticiones en paralelo para que cargue más rápido
            const [storedMasterVolume, storedChannels] = await Promise.all([
                store.get<number>("masterVolume"),
                store.get<SoundChannel[]>("channels"),
            ]);

            if (
                typeof storedMasterVolume === "number" &&
                !isNaN(storedMasterVolume)
            ) {
                // Seteamos el estado visual
                setMasterVolume(storedMasterVolume);
                // Sincronizamos con el backend de Rust directamente (sin llamar a updateMasterVolume de nuevo para evitar re-guardar inútilmente)
                invoke("set_master_volume", {
                    volume: storedMasterVolume / 100.0,
                }).catch(console.error);
            }

            if (storedChannels && storedChannels.length > 0) {
                // Seteamos el estado visual
                setChannels(storedChannels);
                // Sincronizamos con el backend de Rust para que efectivamente empiece a sonar la música guardada!
                storedChannels.forEach((channel) => {
                    if (channel.active && channel.value > 0) {
                        invoke("set_channel_volume", {
                            id: channel.id,
                            volume: channel.value / 100.0,
                        }).catch(console.error);
                    }
                });
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleGetAllSettings();
    }, []);

    return {
        channels,
        masterVolume,
        isLoading,
        updateChannelValue,
        updateMasterVolume,
    };
};
