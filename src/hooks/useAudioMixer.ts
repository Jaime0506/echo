import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

import { store } from "../store/store";
import type { SoundChannel } from "../types/core";
import { defaultChannels } from "../utils/channels";

export const useAudioMixer = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [channels, setChannels] = useState<SoundChannel[]>(defaultChannels);

    const [masterVolume, setMasterVolume] = useState(0);

    const [isPaused, setIsPaused] = useState(false);

    const onPressPlayControl = () => {
        const nextState = !isPaused;
        setIsPaused(nextState);
        store.set("isPaused", nextState);
        invoke("set_global_pause", { paused: nextState }).catch(console.error);
    };

    const updateChannelValue = (id: string, value: number) => {
        const newValuesChannels: SoundChannel[] = channels.map(
            (channel: SoundChannel) =>
                channel.id === id
                    ? { ...channel, value, active: value > 0 }
                    : channel,
        );

        setChannels(newValuesChannels);

        invoke("set_channel_volume", { id, volume: value / 100.0 }).catch(
            console.error,
        );

        store.set("channels", newValuesChannels);

        // Si el nuevo valor es mayor a 0, deberia activarse la reproducción
        if (value > 0) {
            if (isPaused) {
                setIsPaused(false);
                store.set("isPaused", false);
                invoke("set_global_pause", { paused: false }).catch(
                    console.error,
                );
            }
            return;
        }

        // Si todos los valores son 0, entonces debe pausarse
        const hasActiveChannel = newValuesChannels.some(
            (channel) => channel.active && channel.value > 0,
        );

        if (!hasActiveChannel) {
            if (!isPaused) {
                setIsPaused(true);
                store.set("isPaused", true);
                invoke("set_global_pause", { paused: true }).catch(
                    console.error,
                );
            }
        }
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
            const [storedMasterVolume, storedChannels, storedIsPaused] =
                await Promise.all([
                    store.get<number>("masterVolume"),
                    store.get<SoundChannel[]>("channels"),
                    store.get<boolean>("isPaused"),
                ]);

            let initialIsPaused = false;
            if (typeof storedIsPaused === "boolean") {
                initialIsPaused = storedIsPaused;
                setIsPaused(initialIsPaused);
                invoke("set_global_pause", { paused: initialIsPaused }).catch(
                    console.error,
                );
            }

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
                // Merge defaultChannels with storedChannels so new channels are kept
                // and existing ones retain their saved volume/active state
                const mergedChannels = defaultChannels.map((defaultChannel) => {
                    const storedChannel = storedChannels.find(
                        (c) => c.id === defaultChannel.id,
                    );
                    if (storedChannel) {
                        return {
                            ...defaultChannel,
                            value: storedChannel.value,
                            active: storedChannel.active,
                        };
                    }
                    return defaultChannel;
                });

                // Seteamos el estado visual
                setChannels(mergedChannels);

                const hasActiveChannel = mergedChannels.some(
                    (channel) => channel.active && channel.value > 0,
                );

                if (!hasActiveChannel) {
                    setIsPaused(true);
                    invoke("set_global_pause", { paused: true }).catch(
                        console.error,
                    );
                    return;
                }

                // Sincronizamos con el backend de Rust para que efectivamente empiece a sonar la música guardada!
                mergedChannels.forEach((channel) => {
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
        isPaused,
        onPressPlayControl,
    };
};
