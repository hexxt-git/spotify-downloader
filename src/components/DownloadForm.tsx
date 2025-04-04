"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Music, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { downloadTrack } from "@/actions/spotifyActions";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { HistoryList } from "./HistoryList";
import type { Playlist as PlaylistType, Track as TrackType } from "@/types/spotify";

export default function DownloadForm() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [playlist, setPlaylist] = useState<PlaylistType | null>();
    const [downloadingTracks, setDownloadingTracks] = useState<Set<string>>(new Set());
    const [queuedTracks, setQueuedTracks] = useState<Set<string>>(new Set());
    const [downloadIssues, setDownloadIssues] = useState<string[]>([]);
    const [history, setHistory] = useState<PlaylistType[]>([]);

    useEffect(() => {
        const storedHistory = localStorage.getItem("playlistHistory");
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    }, []);

    useEffect(() => {
        setDownloadIssues([]);
    }, [playlist]);

    const updateHistory = (newPlaylist: PlaylistType) => {
        const updatedHistory = [newPlaylist, ...history]
            .filter((pl, idx, self) => idx === self.findIndex((p) => p.url === pl.url))
            .slice(0, 10);
        setHistory(updatedHistory);
        localStorage.setItem("playlistHistory", JSON.stringify(updatedHistory));
    };

    const handleClearHistory = () => {
        setHistory([]);
        localStorage.removeItem("playlistHistory");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsLoading(true);
        try {
            router.push(`/playlist?url=${btoa(url)}`);
        } catch (err) {
            toast.error(
                `Error: ${err instanceof Error ? err.message : "An unknown error occurred"}`
            );
            setIsLoading(false);
        }
    };

    const handleDownloadTrack = async (name: string, trackId: string) => {
        if (downloadingTracks.has(trackId)) return;
        setDownloadingTracks((prev) => new Set(prev).add(trackId));
        // toast(`Downloading track ${name}...`);
        try {
            setDownloadIssues((prev) => prev.filter((id) => id !== trackId));
            await downloadTrack(name, trackId);
            // toast.success(`Track ${name} downloaded successfully!`);
        } catch (err) {
            setDownloadIssues((prev) => [...prev, trackId]);
            toast.error(
                `Error downloading track ${trackId}: ${
                    err instanceof Error ? err.message : "An unknown error occurred"
                }`
            );
        } finally {
            setDownloadingTracks((prev) => {
                const newSet = new Set(prev);
                newSet.delete(trackId);
                return newSet;
            });
        }
    };

    const handleDownloadTrackList = async (tracks: TrackType[]) => {
        if (!tracks.length) return;
        setQueuedTracks(new Set(tracks.map((t) => t.id)));
        const queue = [...tracks];
        const maxConcurrentDownloads = 15;
        const downloadPromises: Promise<void>[] = [];

        const downloadNext = async () => {
            if (queue.length === 0) return;
            const track = queue.shift();
            if (track) {
                setQueuedTracks((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(track.id);
                    return newSet;
                });
                await handleDownloadTrack(track.name, track.id);
                await downloadNext();
            }
        };

        for (let i = 0; i < maxConcurrentDownloads; i++) {
            downloadPromises.push(downloadNext());
        }

        await Promise.all(downloadPromises);
    };

    const handleDownloadAll = async () => {
        toast("Preparing to download all tracks...");
        try {
            await handleDownloadTrackList(playlist?.tracks ?? []);
        } catch (err) {
            toast.error(
                `Error downloading all tracks: ${
                    err instanceof Error ? err.message : "An unknown error occurred"
                }`
            );
        }
    };

    const handleDownloadFailed = async () => {
        toast("Retrying failed downloads...");
        try {
            const failedTracks =
                playlist?.tracks.filter((t) => downloadIssues.includes(t.id)) || [];
            await handleDownloadTrackList(failedTracks);
        } catch (err) {
            toast.error(
                `Error retrying failed tracks: ${
                    err instanceof Error ? err.message : "An unknown error occurred"
                }`
            );
        }
    };

    const deleteTrack = (index: number, mode: "single" | "below" | "above") => {
        if (!playlist) return;

        setPlaylist((prev) => {
            if (!prev) return prev;

            const newTracks = [...prev.tracks];
            if (mode === "below") {
                newTracks.splice(index);
            } else if (mode === "above") {
                newTracks.splice(0, index + 1);
            } else {
                newTracks.splice(index, 1);
            }

            return {
                ...prev,
                tracks: newTracks,
            };
        });
    };

    return (
        <Card className="w-full max-w-3xl bg-gray-900/90 backdrop-blur-sm border-gray-800">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-green-400">
                    Spotify Downloader
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Music className="text-green-400" />
                        <Input
                            type="text"
                            placeholder="Enter Spotify URL (playlist, album, or song)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-grow bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-green-400 focus:border-green-400"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-gray-900 font-medium transition-colors duration-200"
                        disabled={isLoading}
                        title="Fetch tracks from the provided Spotify URL">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing
                            </>
                        ) : (
                            "Fetch Tracks"
                        )}
                    </Button>
                </form>
                <div className="border border-orange-500 bg-orange-300/20 rounded-lg text-orange-400 p-4">
                    <h2 className="text-lg font-bold">Deprecated Status</h2>
                    <p>
                        Due to changes in the spotify API this app is no longer available. we are
                        sorry for the inconvenience you will have to find another provider
                    </p>
                </div>
                <AnimatePresence>
                    {history.length > 0 && (
                        <HistoryList
                            history={history}
                            setPlaylist={(playlist) => {
                                router.push(`/playlist?url=${btoa(playlist.url)}`);
                            }}
                            handleClearHistory={handleClearHistory}
                        />
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
