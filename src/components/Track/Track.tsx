import { useState } from "react";
import { Loader2, Download, Play } from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getDownloadUrl } from "@/actions/spotifyActions";
import type { Track as TrackType } from "@/types/spotify";

interface TrackProps {
    track: TrackType;
    index: number;
    handleDownloadTrack: (name: string, trackId: string) => void;
    downloadingTracks: Set<string>;
    queuedTracks: Set<string>;
    downloadIssues: string[];
    deleteTrack?: (index: number, mode: "single" | "below" | "above") => void;
}

export function Track({
    track,
    index,
    handleDownloadTrack,
    downloadingTracks,
    queuedTracks,
    downloadIssues,
    deleteTrack,
}: TrackProps) {
    if (!track) return null;
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [fetchingStream, setFetchingStream] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleStreamTrack = async (trackId: string) => {
        setFetchingStream(true);
        try {
            const url = await getDownloadUrl(trackId);
            setStreamUrl(url);
        } catch (err) {
            toast.error(
                `Error streaming: ${
                    err instanceof Error
                        ? err.message
                        : "An unknown error occurred"
                }`,
            );
        } finally {
            setFetchingStream(false);
        }
    };

    const isDownloading = downloadingTracks.has(track.id);
    const isQueued = queuedTracks.has(track.id);

    const handleDelete = (e: React.MouseEvent) => {
        setIsDeleting(true);
        if (e.shiftKey) {
            deleteTrack?.(index, "below");
        } else if (e.ctrlKey || e.metaKey) {
            deleteTrack?.(index, "above");
        } else {
            deleteTrack?.(index, "single");
        }
    };

    return (
        <>
            <motion.li
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{
                    duration: 0.2,
                    delay: Math.min(1, index * 0.05),
                }}
                className="relative flex items-center justify-between bg-gray-800 p-4 rounded-md transition-colors duration-200 overflow-hidden"
            >
                <div className="flex items-center space-x-4">
                    <div className="group relative">
                        <img
                            src={track.coverUrl}
                            alt={`${track.name} cover`}
                            className="w-16 h-16 object-cover rounded-md"
                        />
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => handleStreamTrack(track.id)}
                        >
                            {fetchingStream ? (
                                <Loader2 className="h-8 w-8 animate-spin" />
                            ) : (
                                <Play
                                    className="h-6 w-6 text-green-400"
                                    strokeWidth={3}
                                />
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
                {!isDeleting && (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleStreamTrack(track.id)}
                            className="bg-green-500 hover:bg-green-600 text-gray-900 font-medium transition-colors duration-200"
                            size="sm"
                            disabled={fetchingStream}
                            title="Stream this track"
                        >
                            {fetchingStream ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="h-4 w-4" strokeWidth={2.5} />
                            )}
                        </Button>
                        <Button
                            onClick={() =>
                                handleDownloadTrack(track.name, track.id)
                            }
                            className="bg-green-500 hover:bg-green-600 text-gray-900 font-medium transition-colors duration-200"
                            size="sm"
                            disabled={isDownloading || isQueued}
                            title="Download this track"
                        >
                            {isDownloading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isQueued ? (
                                `Queued`
                            ) : (
                                <Download
                                    className="h-4 w-4"
                                    strokeWidth={2.5}
                                />
                            )}
                        </Button>
                        {deleteTrack && (
                            <Button
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200"
                                size="sm"
                                title={`Click to delete this track\nShift+Click to delete this and all tracks below\nCtrl+Click to delete this and all tracks above`}
                            >
                                ✕
                            </Button>
                        )}
                    </div>
                )}
                {downloadIssues.includes(track.id) && (
                    <p className="absolute top-1 right-2 text-red-500 text-2xl">
                        *
                    </p>
                )}
            </motion.li>
            {streamUrl && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gray-800 p-2 rounded-md"
                >
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

function formatDuration(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return hours > 0
        ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        : `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
