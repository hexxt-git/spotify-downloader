"use client";

import { useState, useEffect } from "react";
import { Music, Loader2, Download, Repeat, Play } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { fetchTracks, downloadTrack, getDownloadUrl } from "@/actions/spotifyActions";
import { motion, AnimatePresence } from "framer-motion";
import type { PlaylistResponse } from "@/types/api";
import { toast } from "sonner";

interface Track {
    id: string;
    name: string;
    artists: string;
    coverUrl: string;
    duration_ms: number;
}

interface Playlist {
    url: string;
    name: string;
    type: string;
    image: string;
    owner: string;
    artists: string;
    tracks: Track[];
}

interface TrackListProps {
    playlist: Playlist;
    handleDownloadTrack: (name: string, trackId: string) => void;
    downloadingTracks: Set<string>;
    downloadIssues: string[];
}

function TrackList({
    playlist,
    handleDownloadTrack,
    downloadingTracks,
    downloadIssues,
}: TrackListProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-400">Track List</h2>
            <ul className="space-y-3">
                {playlist.tracks.map((track, index) => (
                    <Track
                        key={track.id}
                        track={track}
                        index={index}
                        handleDownloadTrack={handleDownloadTrack}
                        downloadingTracks={downloadingTracks}
                        downloadIssues={downloadIssues}
                    />
                ))}
            </ul>
        </div>
    );
}

interface TrackProps {
    track: Track;
    index: number;
    handleDownloadTrack: (name: string, trackId: string) => void;
    downloadingTracks: Set<string>;
    downloadIssues: string[];
}

function Track({
    track,
    index,
    handleDownloadTrack,
    downloadingTracks,
    downloadIssues,
}: TrackProps) {
    const formatDuration = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return hours > 0
            ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
                  .toString()
                  .padStart(2, "0")}`
            : `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [fetchingStream, setFetchingStream] = useState(false);

    const handleStreamTrack = async (trackId: string) => {
        setFetchingStream(true);
        try {
            const url = await getDownloadUrl(trackId);
            setStreamUrl(url);
        } catch (err) {
            toast.error(
                `Error streaming: ${
                    err instanceof Error ? err.message : "An unknown error occurred"
                }`
            );
        } finally {
            setFetchingStream(false);
        }
    };

    return (
        <>
            <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: Math.min(1, index * 0.05) }}
                className="relative flex items-center justify-between bg-gray-800 p-4 rounded-md transition-colors duration-200">
                <div className="flex items-center space-x-4">
                    <div className="group relative">
                        <img
                            src={track.coverUrl}
                            alt={`${track.name} cover`}
                            className="w-16 h-16 object-cover rounded-md"
                        />
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => handleStreamTrack(track.id)}>
                            {fetchingStream ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                            ) : (
                                <Play className="h-6 w-6 text-green-400" strokeWidth={3} />
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold text-white">{track.name}</p>
                        <p className="text-sm text-gray-400">
                            {track.artists} {track.duration_ms && "-"}{" "}
                            {formatDuration(track.duration_ms)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleStreamTrack(track.id)}
                        className="bg-green-500 hover:bg-green-600 text-gray-900 font-medium transition-colors duration-200"
                        size="sm"
                        disabled={fetchingStream}>
                        {fetchingStream ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4" strokeWidth={2.5} />
                        )}
                    </Button>
                    <Button
                        onClick={() => handleDownloadTrack(track.name, track.id)}
                        className="bg-green-500 hover:bg-green-600 text-gray-900 font-medium transition-colors duration-200"
                        size="sm"
                        disabled={downloadingTracks.has(track.id)}>
                        {downloadingTracks.has(track.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" strokeWidth={2.5} />
                        )}
                        Download
                    </Button>
                </div>
                {downloadIssues.includes(track.id) && (
                    <p className="absolute top-1 right-2 text-red-500 text-2xl">*</p>
                )}
            </motion.li>
            {streamUrl && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gray-800 p-2 rounded-md">
                    <audio
                        autoPlay
                        src={streamUrl}
                        controls
                        className="w-full bg-transparent rounded-sm"
                    />
                </motion.div>
            )}
        </>
    );
}

interface PlaylistDetailsProps {
    playlist: Playlist;
    setPlaylist: (playlist: Playlist | null) => void;
}

function PlaylistDetails({ playlist, setPlaylist }: PlaylistDetailsProps) {
    return (
        <div className="space-y-4 bg-gray-800 p-4 rounded-md">
            <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                    <img
                        src={playlist.image}
                        alt="Playlist cover"
                        className="w-16 h-16 object-cover rounded-md"
                    />
                    <div>
                        <p className="font-semibold text-white">{playlist.name}</p>
                        <p className="text-sm text-gray-400">
                            {playlist.type === "track"
                                ? "Single Track"
                                : `${playlist.tracks.length} tracks`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setPlaylist(null)}
                    className="text-gray-400 hover:text-gray-200 transition-colors duration-200 pe-4">
                    ✕
                </button>
            </div>
        </div>
    );
}

interface HistoryListProps {
    history: Playlist[];
    setPlaylist: (playlist: Playlist) => void;
    handleClearHistory: () => void;
}

function HistoryList({ history, setPlaylist, handleClearHistory }: HistoryListProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4">
            <div className="flex items-end justify-between">
                <h2 className="text-xl font-semibold text-green-400">History</h2>
                <button
                    onClick={handleClearHistory}
                    className="text-gray-400 hover:text-gray-200 transition-colors duration-200 me-2">
                    clear
                </button>
            </div>
            <ul className="space-y-3">
                {history.map((playlist, index) => (
                    <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between bg-gray-800 p-4 rounded-md hover:bg-gray-750 transition-colors duration-200 cursor-pointer"
                        onClick={() => setPlaylist(playlist)}>
                        <div className="flex items-center space-x-4">
                            <img
                                src={playlist.image}
                                alt={`${playlist.name} cover`}
                                className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                                <p className="font-semibold text-white">{playlist.name}</p>
                                <p className="text-sm text-gray-400">
                                    {playlist.type} {playlist.owner && "by"} {playlist.owner}{" "}
                                    {playlist.artists && "by"} {playlist.artists}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {playlist.tracks.length} tracks
                                </p>
                            </div>
                        </div>
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
}

export default function DownloadForm() {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [playlist, setPlaylist] = useState<Playlist | null>();
    const [downloadingTracks, setDownloadingTracks] = useState<Set<string>>(new Set());
    const [downloadIssues, setDownloadIssues] = useState<string[]>([]);
    const [history, setHistory] = useState<Playlist[]>([]);

    useEffect(() => {
        const storedHistory = localStorage.getItem("playlistHistory");
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    }, []);

    useEffect(() => {
        setDownloadIssues([]);
    }, [playlist]);

    const updateHistory = (newPlaylist: Playlist) => {
        const updatedHistory = [newPlaylist, ...history]
            .filter(
                (playlist, index, self) => index === self.findIndex((p) => p.url === playlist.url)
            )
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
        toast("Fetching tracks...");

        try {
            const trackCollection: PlaylistResponse = await fetchTracks(url);
            if (!trackCollection.result)
                throw new Error(trackCollection.error.message || "Failed to fetch tracks");

            let tracks: Track[] = [];
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
                    trackCollection.result.tracks?.map((track) => ({
                        id: track.id,
                        name: track.name,
                        artists: track.artists,
                        coverUrl: track.image || trackCollection.result.image,
                        duration_ms: track.duration_ms,
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
            toast.success(`Found ${tracks.length} tracks`);
            updateHistory(newPlaylist);
        } catch (err) {
            toast.error(
                `Error: ${err instanceof Error ? err.message : "An unknown error occurred"}`
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadTrack = async (name: string, trackId: string) => {
        if (downloadingTracks.has(trackId)) return;
        setDownloadingTracks((prev) => new Set(prev).add(trackId));
        toast(`Downloading track ${name}...`);
        try {
            setDownloadIssues((prev) => prev.filter((id) => id !== trackId));
            await downloadTrack(name, trackId);
            toast.success(`Track ${name} downloaded successfully!`);
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

    const handleDownloadFailed = async () => {
        toast("Retrying failed downloads...");
        try {
            for (const trackId of downloadIssues) {
                const track = playlist!.tracks.find((t) => t.id === trackId);
                if (track) {
                    await handleDownloadTrack(track.name, track.id);
                }
            }
        } catch (err) {
            toast.error(
                `Error retrying failed tracks: ${
                    err instanceof Error ? err.message : "An unknown error occurred"
                }`
            );
        }
    };

    const handleDownloadAll = async () => {
        toast("Preparing to download all tracks...");
        try {
            for (const track of playlist!.tracks) {
                await handleDownloadTrack(track.name, track.id);
            }
        } catch (err) {
            toast.error(
                `Error downloading all tracks: ${
                    err instanceof Error ? err.message : "An unknown error occurred"
                }`
            );
        } finally {
        }
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
                        disabled={isLoading}>
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
                <AnimatePresence>
                    {playlist ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="space-y-4">
                            <h2 className="text-xl font-semibold text-green-400 capitalize">
                                {playlist.type}
                            </h2>
                            <PlaylistDetails playlist={playlist} setPlaylist={setPlaylist} />
                            {playlist.type === "track" ? (
                                <Track
                                    track={playlist.tracks[0]}
                                    index={0}
                                    handleDownloadTrack={handleDownloadTrack}
                                    downloadingTracks={downloadingTracks}
                                    downloadIssues={downloadIssues}
                                />
                            ) : (
                                <>
                                    <Button
                                        onClick={handleDownloadAll}
                                        className="w-full bg-green-500 hover:bg-green-600 text-gray-900 font-medium transition-colors duration-200">
                                        Download All
                                        <Download className="ml-2 h-4 w-4" />
                                        <Download className="h-4 w-4" />
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    {downloadIssues.length > 0 && (
                                        <Button
                                            onClick={handleDownloadFailed}
                                            className="w-full bg-orange-500 opacity-100 hover:opacity-90 hover:bg-orange-500 text-gray-900 font-medium transition-opacity duration-200">
                                            Retry Failed Downloads
                                            <Repeat className="mr-2 h-4 w-4" />
                                        </Button>
                                    )}
                                    {downloadingTracks.size > 0 && (
                                        <div className="text-sm text-gray-200 capitalize">
                                            {downloadingTracks.size} downloads in progress ...
                                        </div>
                                    )}
                                    {downloadIssues.length > 0 && (
                                        <div className="text-sm text-red-500">
                                            {downloadIssues.length} downloads failed *
                                        </div>
                                    )}
                                    <TrackList
                                        playlist={playlist}
                                        handleDownloadTrack={handleDownloadTrack}
                                        downloadingTracks={downloadingTracks}
                                        downloadIssues={downloadIssues}
                                    />
                                </>
                            )}
                        </motion.div>
                    ) : (
                        history.length > 0 && (
                            <HistoryList
                                history={history}
                                setPlaylist={setPlaylist}
                                handleClearHistory={handleClearHistory}
                            />
                        )
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
