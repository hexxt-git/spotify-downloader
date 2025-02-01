import type { Playlist } from "@/types/spotify";

interface PlaylistDetailsProps {
    playlist: Playlist;
    setPlaylist: (playlist: Playlist | null) => void;
}

export function PlaylistDetails({
    playlist,
    setPlaylist,
}: PlaylistDetailsProps) {
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
                        <p className="font-semibold text-white">
                            {playlist.name}
                        </p>
                        <p className="text-sm text-gray-400">
                            {playlist.type === "track"
                                ? "Single Track"
                                : `${playlist.tracks.length} tracks`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setPlaylist(null)}
                    className="text-gray-400 hover:text-gray-200 transition-colors duration-200 pe-4"
                    title="Close playlist and return to history"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
