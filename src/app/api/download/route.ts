import { NextRequest, NextResponse } from "next/server";
import { FileResponse } from "@/types/api";
import { fetchWithRetry } from "@/lib/utils";

const downloadUrl: string = process.env.DOWNLOAD_API_URL || "";

export async function GET(request: NextRequest) {
    if (!downloadUrl) {
        console.error("Missing DOWNLOAD_API_URL environment variable");
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Missing id parameter" },
            { status: 400 },
        );
    }

    try {
        const response = await fetchWithRetry(downloadUrl, {
            credentials: "omit",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0",
                Accept: "*/*",
                "Accept-Language": "en-US,en;q=0.5",
                "Content-Type": "application/json",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "Sec-GPC": "1",
                Priority: "u=0",
                Pragma: "no-cache",
                "Cache-Control": "no-cache",
            },
            referrer: "https://spotydown.com/",
            body: `{\"url\":\"https://open.spotify.com/track/${id}\"}`,
            method: "POST",
            mode: "cors",
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error: ${response.status} ${errorText}`);
            return NextResponse.json(
                { error: `API error: ${response.status}` },
                { status: response.status },
            );
        }

        const data: FileResponse = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching download URL:", error);
        return NextResponse.json(
            { error: "Failed to fetch download URL" },
            { status: 500 },
        );
    }
}
