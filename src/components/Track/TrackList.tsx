import { Track } from "./Track";
import { AnimatePresence } from "framer-motion";
import type { Track as TrackType, Playlist } from "@/types/spotify";

interface TrackListProps {
    playlist: Playlist;
    handleDownloadTrack: (name: string, trackId: string) => void;
    downloadingTracks: Set<string>;
    queuedTracks: Set<string>;
    downloadIssues: string[];
    deleteTrack: (index: number, mode: "single" | "below" | "above") => void;
}

export default function TrackList({
    playlist,
    handleDownloadTrack,
    downloadingTracks,
    queuedTracks,
    downloadIssues,
    deleteTrack,
}: TrackListProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-400">Track List</h2>
            <ul className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {playlist.tracks.map((track: TrackType, index: number) => (
                        <Track
                            key={track?.id || index}
                            track={track}
                            index={index}
                            handleDownloadTrack={handleDownloadTrack}
                            downloadingTracks={downloadingTracks}
                            queuedTracks={queuedTracks}
                            downloadIssues={downloadIssues}
                            deleteTrack={deleteTrack}
                        />
                    ))}
                </AnimatePresence>
            </ul>
        </div>
    );
}
