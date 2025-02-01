import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retries = 10,
    delay = 500,
): Promise<Response> {
    let currentDelay = delay;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            const errorText = await response.text();
            console.error(`API error: ${response.status} ${errorText}`);
        } catch (error) {
            console.error(`Fetch attempt ${i + 1} failed:`, error);
        }
        if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, currentDelay));
            currentDelay *= 2;
        }
    }
    throw new Error("Failed to fetch after multiple attempts");
}
