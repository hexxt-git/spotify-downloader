export type PlaylistResponse = {
    result: {
        id: string;
        type: string;
        name: string;
        image: string;
        owner: string;
        artists: string;
        tracks: {
            id: string;
            name: string;
            artists: string;
            duration_ms: number;
            image?: string;
        }[];
        gid: number;
    };
    error: { message: string };
};

export type FileResponse = {
    file_url: string;
};
