"use client";

import type { PlaylistResponse, FileResponse } from "@/types/api";

export async function fetchTracks(url: string) {
    url = url.trim();
    if (/(http(s?):\/\/)|(open.spotify.com)/.test(url)) {
        const response = await fetch(`/api/tracks?url=${url}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch tracks");
        }

        const data: PlaylistResponse = await response.json();
        return data;
    } else {
        // TODO: implement a search feature
        throw new Error("Invalid URL");
    }
}

export async function getDownloadUrl(trackId: string): Promise<string> {
    const response = await fetch(`/api/download?id=${trackId}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get download URL");
    }

    const data: FileResponse = await response.json();
    return data.file_url;
}

export async function downloadTrack(name: string, trackId: string) {
    const fileUrl = await getDownloadUrl(trackId);
    const downloadResponse = await fetch(fileUrl);
    if (!downloadResponse.ok) {
        throw new Error("Failed to download the file");
    }

    if (typeof window !== "undefined") {
        const blob = await downloadResponse.blob();
        if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
            (window.navigator as any).msSaveOrOpenBlob(blob, `${name}.mp3`);
        } else {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.setAttribute("download", `${name}.mp3`);

            // Fallback for browsers that don't support "download"
            if (typeof a.download === "undefined") {
                window.open(url);
            } else {
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }

            window.URL.revokeObjectURL(url);
        }
    }
}
