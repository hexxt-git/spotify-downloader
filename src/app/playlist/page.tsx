"use client";

import { PlaylistView } from "@/components/PlaylistView";
import { useSearchParams } from "next/navigation";

export default function PlaylistPage() {
    const searchParams = useSearchParams();
    const url = searchParams.get("url");

    if (!url) return null;

    return (
        <main className="min-h-screen text-white flex flex-col items-center justify-center p-4 lg:p-12">
            <PlaylistView encodedUrl={url} />
        </main>
    );
}
