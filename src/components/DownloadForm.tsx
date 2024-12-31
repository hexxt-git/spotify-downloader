"use client";

import { useState, useEffect } from "react";
import { Music, Loader2, Download, Boxes, Repeat } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { fetchTracks, downloadTrack } from "@/actions/spotifyActions";
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
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-400">Track List</h2>
            <ul className="space-y-3">
                {playlist.tracks.map((track, index) => (
                    <motion.li
                        key={track.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative flex items-center justify-between bg-gray-800 p-4 rounded-md transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                            <img
                                src={track.coverUrl}
                                alt={`${track.name} cover`}
                                className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                                <p className="font-semibold text-white">{track.name}</p>
                                <p className="text-sm text-gray-400">
                                    {track.artists} {track.duration_ms && "-"}{" "}
                                    {formatDuration(track.duration_ms)}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => handleDownloadTrack(track.name, track.id)}
                            className="bg-green-500 hover:bg-green-600 text-gray-900 font-medium transition-colors duration-200"
                            size="sm"
                            disabled={downloadingTracks.has(track.id)}>
                            {downloadingTracks.has(track.id) ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            Download
                        </Button>
                        {downloadIssues.includes(track.id) && (
                            <p className="absolute top-1 right-2 text-red-500 text-2xl">*</p>
                        )}
                    </motion.li>
                ))}
            </ul>
        </div>
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
                        <p className="text-sm text-gray-400">{playlist.tracks.length} tracks</p>
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
}

function HistoryList({ history, setPlaylist }: HistoryListProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4">
            <h2 className="text-xl font-semibold text-green-400">History</h2>
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
    const [downloadIssues, setDownloadIssues] = useState<string[]>([]); // keeps Ids of tracks that failed to download
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
            .slice(0, 5);
        setHistory(updatedHistory);
        localStorage.setItem("playlistHistory", JSON.stringify(updatedHistory));
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
            const tracks = trackCollection.result.tracks.map((track) => ({
                id: track.id,
                name: track.name,
                artists: track.artists,
                coverUrl: track.image || trackCollection.result.image,
                duration_ms: track.duration_ms,
            }));
            const newPlaylist = {
                url,
                name: trackCollection.result.name,
                type: trackCollection.result.type,
                image: trackCollection.result.image,
                owner: trackCollection.result.owner,
                artists: trackCollection.result.artists,
                tracks: tracks,
            };
            if (
                (playlist &&
                    newPlaylist.name !== playlist.name &&
                    newPlaylist.type !== playlist.type &&
                    newPlaylist.owner !== playlist.owner &&
                    newPlaylist.artists !== playlist.artists) ||
                !playlist
            ) {
                setPlaylist(newPlaylist);
                toast.success(`Found ${tracks.length} tracks`);
                updateHistory(newPlaylist);
            } else {
                console.log(playlist, newPlaylist);
                toast.success("Playlist already open");
            }
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
            await Promise.all(
                downloadIssues.map((trackId) => {
                    const track = playlist!.tracks.find((t) => t.id === trackId);
                    if (track) {
                        return handleDownloadTrack(track.name, track.id);
                    }
                })
            );
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
            await Promise.all(
                playlist!.tracks.map((track) => handleDownloadTrack(track.name, track.id))
            );
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
                            <Button
                                onClick={handleDownloadAll}
                                className="w-full bg-green-500 hover:bg-green-600 text-gray-900 font-medium transition-colors duration-200">
                                {<Boxes className="mr-2 h-4 w-4" />}
                                Download All
                            </Button>
                            {downloadIssues.length > 0 && (
                                <Button
                                    onClick={handleDownloadFailed}
                                    className="w-full bg-orange-500 opacity-100 hover:opacity-90 hover:bg-orange-500 text-gray-900 font-medium transition-opacity duration-200">
                                    <Repeat className="mr-2 h-4 w-4" />
                                    Retry Failed Downloads
                                </Button>
                            )}
                            <TrackList
                                playlist={playlist}
                                handleDownloadTrack={handleDownloadTrack}
                                downloadingTracks={downloadingTracks}
                                downloadIssues={downloadIssues}
                            />
                        </motion.div>
                    ) : (
                        history.length > 0 && (
                            <HistoryList history={history} setPlaylist={setPlaylist} />
                        )
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
