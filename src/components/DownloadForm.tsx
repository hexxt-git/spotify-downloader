"use client";

import { useState, useEffect } from "react";
import { Music, Loader2, Download, Boxes } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { fetchTracks, downloadTrack, downloadAllTracks } from "@/actions/spotifyActions";
import { motion, AnimatePresence } from "framer-motion";
import type { PlaylistResponse } from "@/types/api";
import { toast } from "sonner";

interface Track {
    id: string;
    name: string;
    artists: string;
    coverUrl: string;
}

interface Playlist {
    url: string;
    name: string;
    type: string;
    image: string;
    owner: string;
    tracks: Track[];
}

interface TrackListProps {
    playlist: Playlist;
    handleDownloadTrack: (name: string, trackId: string) => void;
    isDownloadingAll: boolean;
    downloadingTracks: Set<string>;
}

function TrackList({ playlist, handleDownloadTrack, isDownloadingAll, downloadingTracks }: TrackListProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-400">Track List</h2>
            <ul className="space-y-3">
                {playlist.tracks.map((track) => (
                    <motion.li
                        key={track.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center justify-between bg-gray-800 p-4 rounded-md hover:bg-gray-750 transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                            <img
                                src={track.coverUrl}
                                alt={`${track.name} cover`}
                                className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                                <p className="font-semibold text-white">{track.name}</p>
                                <p className="text-sm text-gray-400">{track.artists}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => handleDownloadTrack(track.name, track.id)}
                            className="bg-green-500 hover:bg-green-600 text-gray-900 font-medium transition-colors duration-200"
                            size="sm"
                            disabled={isDownloadingAll || downloadingTracks.has(track.id)}>
                            {downloadingTracks.has(track.id) ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            Download
                        </Button>
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
                                <p className="text-sm text-gray-400">{playlist.type} by {playlist.owner}</p>
                                <p className="text-sm text-gray-400">{playlist.tracks.length} tracks</p>
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
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);
    const [history, setHistory] = useState<Playlist[]>([]);

    useEffect(() => {
        const storedHistory = localStorage.getItem("playlistHistory");
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    }, []);

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
        setPlaylist(null);

        try {
            const trackCollection: PlaylistResponse = await fetchTracks(url);
            const tracks = trackCollection.result.tracks.map((track) => ({
                id: track.id,
                name: track.name,
                artists: track.artists,
                coverUrl: track.image || trackCollection.result.image,
            }));
            const newPlaylist = {
                url,
                name: trackCollection.result.name,
                type: trackCollection.result.type,
                image: trackCollection.result.image,
                owner: trackCollection.result.owner,
                tracks: tracks,
            };
            setPlaylist(newPlaylist);
            toast.success(`Found ${tracks.length} tracks`);
            updateHistory(newPlaylist);
        } catch (err) {
            toast.error(`Error: ${err instanceof Error ? err.message : "An unknown error occurred"}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadTrack = async (name: string, trackId: string) => {
        setDownloadingTracks((prev) => new Set(prev).add(trackId));
        toast(`Downloading track ${name}...`);
        try {
            await downloadTrack(name, trackId);
            toast.success(`Track ${name} downloaded successfully!`);
        } catch (err) {
            toast.error(`Error downloading track ${trackId}: ${err instanceof Error ? err.message : "An unknown error occurred"}`);
        } finally {
            setDownloadingTracks((prev) => {
                const newSet = new Set(prev);
                newSet.delete(trackId);
                return newSet;
            });
        }
    };

    const handleDownloadAllSeparate = async () => {
        setIsDownloadingAll(true);
        toast("Preparing to download all tracks...");
        try {
            await downloadAllTracks(playlist?.tracks || []);
            toast.success("All tracks downloaded successfully!");
        } catch (err) {
            toast.error(`Error downloading all tracks: ${err instanceof Error ? err.message : "An unknown error occurred"}`);
        } finally {
            setIsDownloadingAll(false);
        }
    };

    return (
        <Card className="w-full max-w-3xl bg-gray-900 border-gray-800">
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
                            <TrackList
                                playlist={playlist}
                                handleDownloadTrack={handleDownloadTrack}
                                isDownloadingAll={isDownloadingAll}
                                downloadingTracks={downloadingTracks}
                            />
                            <Button
                                onClick={handleDownloadAllSeparate}
                                className="w-full bg-green-500 hover:bg-green-600 text-gray-900 font-medium transition-colors duration-200"
                                disabled={isDownloadingAll || downloadingTracks.size > 0}>
                                {isDownloadingAll ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Boxes className="mr-2 h-4 w-4" />
                                )}
                                Download All Separately
                            </Button>
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
