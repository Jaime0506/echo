export type SoundChannel = {
    id: string;
    label: string;
    icon: string;
    value: number;
    active: boolean;

    attribution: {
        author: string;
        authorUrl?: string;
        platform: string;
        soundName?: string;
        license: string;
        licenseUrl?: string;
        uri: string;
        fileName: string;
    };
};
