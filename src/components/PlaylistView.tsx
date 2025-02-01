"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Download, Repeat, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { fetchTracks, downloadTrack } from "@/actions/spotifyActions";
import { PlaylistDetails } from "./PlaylistDetails";
import TrackList from "./Track/TrackList";
import { Track } from "./Track/Track";
import type { Playlist, Track as TrackType } from "@/types/spotify";
import type { PlaylistResponse } from "@/types/api";

interface PlaylistViewProps {
    encodedUrl: string;
}

export function PlaylistView({ encodedUrl }: PlaylistViewProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [downloadingTracks, setDownloadingTracks] = useState<Set<string>>(
        new Set(),
    );
    const [queuedTracks, setQueuedTracks] = useState<Set<string>>(new Set());
    const [downloadIssues, setDownloadIssues] = useState<string[]>([]);

    useEffect(() => {
        const loadPlaylist = async () => {
            try {
                const url = atob(encodedUrl);

                // Check localStorage first
                const storedHistory = localStorage.getItem("playlistHistory");
                if (storedHistory) {
                    const history: Playlist[] = JSON.parse(storedHistory);
                    const storedPlaylist = history.find((p) => p.url === url);
                    if (storedPlaylist) {
                        setPlaylist(storedPlaylist);
                        setIsLoading(false);
                        return;
                    }
                }

                // If not in history, fetch from API
                const trackCollection: PlaylistResponse =
                    await fetchTracks(url);
                if (!trackCollection.result) {
                    throw new Error(
                        trackCollection.error.message ||
                            "Failed to fetch tracks",
                    );
                }

                let tracks: TrackType[] = [];
                if (trackCollection.result.type === "track") {
                    tracks = [
                        {
                            id: trackCollection.result.id,
                            name: trackCollection.result.name,
                            artists: trackCollection.result.artists,
                            coverUrl: trackCollection.result.image,
                            duration_ms: trackCollection.result.duration_ms,
                        },
                    ];
                } else {
                    tracks =
                        trackCollection.result.tracks?.map((t) => ({
                            id: t.id,
                            name: t.name,
                            artists: t.artists,
                            coverUrl: t.image || trackCollection.result.image,
                            duration_ms: t.duration_ms,
                        })) || [];
                }

                const newPlaylist: Playlist = {
                    url,
                    name: trackCollection.result.name,
                    type: trackCollection.result.type,
                    image: trackCollection.result.image,
                    owner: trackCollection.result.owner,
                    artists: trackCollection.result.artists,
                    tracks,
                };

                setPlaylist(newPlaylist);
                updateHistory(newPlaylist);
            } catch (err) {
                toast.error(
                    `Error: ${err instanceof Error ? err.message : "An unknown error occurred"}`,
                );
                router.push("/");
            } finally {
                setIsLoading(false);
            }
        };

        loadPlaylist();
    }, [encodedUrl, router]);

    const updateHistory = (newPlaylist: Playlist) => {
        const storedHistory = localStorage.getItem("playlistHistory");
        const history = storedHistory ? JSON.parse(storedHistory) : [];
        const updatedHistory = [newPlaylist, ...history]
            .filter(
                (pl, idx, self) =>
                    idx === self.findIndex((p) => p.url === pl.url),
            )
            .slice(0, 10);
        localStorage.setItem("playlistHistory", JSON.stringify(updatedHistory));
    };

    const handleDownloadTrack = async (name: string, trackId: string) => {
        if (downloadingTracks.has(trackId)) return;
        setDownloadingTracks((prev) => new Set(prev).add(trackId));
        try {
            setDownloadIssues((prev) => prev.filter((id) => id !== trackId));
            await downloadTrack(name, trackId);
        } catch (err) {
            setDownloadIssues((prev) => [...prev, trackId]);
            toast.error(
                `Error downloading track ${trackId}: ${
                    err instanceof Error
                        ? err.message
                        : "An unknown error occurred"
                }`,
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
                    err instanceof Error
                        ? err.message
                        : "An unknown error occurred"
                }`,
            );
        }
    };

    const handleDownloadFailed = async () => {
        toast("Retrying failed downloads...");
        try {
            const failedTracks =
                playlist?.tracks.filter((t) => downloadIssues.includes(t.id)) ||
                [];
            await handleDownloadTrackList(failedTracks);
        } catch (err) {
            toast.error(
                `Error retrying failed tracks: ${
                    err instanceof Error
                        ? err.message
                        : "An unknown error occurred"
                }`,
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

    if (isLoading) {
        return (
            <Card className="w-full max-w-3xl bg-gray-900/90 backdrop-blur-sm border-gray-800">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-green-400">
                        Loading...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (!playlist) {
        return null;
    }

    return (
        <Card className="w-full max-w-3xl bg-gray-900/90 backdrop-blur-sm border-gray-800">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-green-400">
                    {playlist.type}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="space-y-4"
                >
                    <PlaylistDetails
                        playlist={playlist}
                        setPlaylist={(p) => p === null && router.push("/")}
                    />
                    {playlist.type === "track" ? (
                        <Track
                            track={playlist.tracks[0]}
                            index={0}
                            handleDownloadTrack={handleDownloadTrack}
                            downloadingTracks={downloadingTracks}
                            queuedTracks={queuedTracks}
                            downloadIssues={downloadIssues}
                        />
                    ) : (
                        <>
                            <Button
                                onClick={handleDownloadAll}
                                className="w-full bg-green-500 hover:bg-green-600 text-gray-900 font-medium transition-colors duration-200"
                                title="Download all tracks in the playlist"
                            >
                                Download All
                                <Download className="ml-2 h-4 w-4" />
                                <Download className="h-4 w-4" />
                                <Download className="h-4 w-4" />
                            </Button>
                            <div>
                                {downloadIssues.length > 0 && (
                                    <Button
                                        onClick={handleDownloadFailed}
                                        className="w-full bg-orange-500 opacity-100 hover:opacity-90 hover:bg-orange-500 text-gray-900 font-medium transition-opacity duration-200"
                                        title="Retry downloading tracks that failed"
                                    >
                                        Retry Failed Downloads
                                        <Repeat className="mr-2 h-4 w-4" />
                                    </Button>
                                )}
                                {downloadingTracks.size > 0 && (
                                    <div className="text-sm text-gray-200 capitalize">
                                        {downloadingTracks.size} downloads in
                                        progress ...
                                    </div>
                                )}
                                {queuedTracks.size > 0 && (
                                    <div className="text-sm text-blue-400 capitalize">
                                        {queuedTracks.size} in queue ...
                                    </div>
                                )}
                                {downloadIssues.length > 0 && (
                                    <div className="text-sm text-red-500">
                                        {downloadIssues.length} downloads failed
                                        *
                                    </div>
                                )}
                            </div>
                            <TrackList
                                playlist={playlist}
                                handleDownloadTrack={handleDownloadTrack}
                                downloadingTracks={downloadingTracks}
                                queuedTracks={queuedTracks}
                                downloadIssues={downloadIssues}
                                deleteTrack={deleteTrack}
                            />
                        </>
                    )}
                </motion.div>
            </CardContent>
        </Card>
    );
}
