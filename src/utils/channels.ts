import type { SoundChannel } from "../types/core";

export const defaultChannels: SoundChannel[] = [
    {
        id: "rain",
        label: "Lluvia",
        icon: "rain",
        value: 0,
        active: false,
        attribution: {
            author: "Ayton",
            authorUrl: "https://freesound.org/people/Ayton/",
            platform: "Freesound",
            soundName: "Rain Loop Ontario",
            license: "Attribution 3.0",
            licenseUrl: "http://creativecommons.org/licenses/by/3.0/",
            uri: "https://freesound.org/people/Ayton/sounds/212799/",
            fileName: "212799__ayton__rain-loop-ontario-loop.wav",
        },
    },
    {
        id: "wind",
        label: "Viento",
        icon: "wind",
        value: 0,
        active: false,
        attribution: {
            author: "gnrja",
            authorUrl: "https://freesound.org/people/gnrja/",
            platform: "Freesound",
            soundName: "Storm Winds.aiff",
            license: "Attribution 4.0",
            licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
            uri: "https://freesound.org/people/gnrja/sounds/151770/",
            fileName: "151770__gnrja__storm-winds-loop.wav",
        },
    },
];
