import { motion } from "framer-motion";
import type { Playlist } from "@/types/spotify";

interface HistoryListProps {
    history: Playlist[];
    setPlaylist: (playlist: Playlist) => void;
    handleClearHistory: () => void;
}

export function HistoryList({
    history,
    setPlaylist,
    handleClearHistory,
}: HistoryListProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
        >
            <div className="flex items-end justify-between">
                <h2 className="text-xl font-semibold text-green-400">
                    History
                </h2>
                <button
                    onClick={handleClearHistory}
                    className="text-gray-400 hover:text-gray-200 transition-colors duration-200 me-2"
                    title="Clear playlist history"
                >
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
                        onClick={() => setPlaylist(playlist)}
                    >
                        <div className="flex items-center space-x-4">
                            <img
                                src={playlist.image}
                                alt={`${playlist.name} cover`}
                                className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                                <p className="font-semibold text-white">
                                    {playlist.name}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {playlist.type} {playlist.owner && "by"}{" "}
                                    {playlist.owner} {playlist.artists && "by"}{" "}
                                    {playlist.artists}
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
