export type PlaylistResponse = {
    result: {
        id: string;
        type: string;
        name: string;
        image: string;
        owner: string;
        tracks: {
            id: string;
            name: string;
            artists: string;
            duration_ms: number;
            image?: string;
        }[];
        gid: number;
    };
};

export type FileResponse = {
    file_url: string;
};

