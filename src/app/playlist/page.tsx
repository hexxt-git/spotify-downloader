"use client";

import { PlaylistView } from "@/components/PlaylistView";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PlaylistContent() {
    const searchParams = useSearchParams();
    const url = searchParams.get("url");

    if (!url) return null;

    return <PlaylistView encodedUrl={url} />;
}

export default function PlaylistPage() {
    return (
        <main className="min-h-screen text-white flex flex-col items-center justify-center p-4 lg:p-12">
            <Suspense>
                <PlaylistContent />
            </Suspense>
        </main>
    );
}
