"use client";

import type { PlaylistResponse, FileResponse } from "@/types/api";

export async function fetchTracks(url: string) {
    const response = await fetch(`/api/tracks?url=${url}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch tracks");
    }

    const data: PlaylistResponse = await response.json();

    return data;
}

export async function downloadTrack(name: string, trackId: string) {
    const response = await fetch(`/api/download?id=${trackId}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get download URL");
    }

    const data: FileResponse = await response.json();

    // Initiate the download
    const downloadResponse = await fetch(data.file_url);
    if (!downloadResponse.ok) {
        throw new Error("Failed to download the file");
    }

    console.log(downloadResponse);

    if (typeof window !== "undefined") {
        const blob = await downloadResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `${name}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
export async function downloadAllTracks(tracks: { name: string; id: string }[]) {
    await Promise.all(tracks.map(({ name, id }) => downloadTrack(name, id)));
}
