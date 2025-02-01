export interface Track {
    id: string;
    name: string;
    artists: string;
    coverUrl: string;
    duration_ms: number;
}

export interface Playlist {
    url: string;
    name: string;
    type: string;
    image: string;
    owner: string;
    artists: string;
    tracks: Track[];
}
