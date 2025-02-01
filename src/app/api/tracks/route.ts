import { NextRequest, NextResponse } from "next/server";
import { PlaylistResponse } from "@/types/api";
import { fetchWithRetry } from "@/lib/utils";

const tracksUrl: string = process.env.TRACKS_API_URL || "";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!tracksUrl) {
        console.error("Tracks API URL is not configured");
        return NextResponse.json(
            { error: "Tracks API URL is not configured" },
            { status: 500 },
        );
    }

    try {
        const response = await fetchWithRetry(
            `${tracksUrl}?url=${encodeURIComponent(url)}`,
            {
                credentials: "omit",
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0",
                    Accept: "application/json, text/plain, */*",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "cross-site",
                    "Sec-GPC": "1",
                },
                referrer: "https://spotifymp3.com/",
                method: "GET",
                mode: "cors",
            },
        );

        const data: PlaylistResponse = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching tracks:", error);
        return NextResponse.json(
            { error: "Failed to fetch tracks" },
            { status: 500 },
        );
    }
}
