import { Toaster } from "sonner";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Spotify Downloader",
    description: "Download your favorite Spotify playlists, albums, and songs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} text-white antialiased`}>
                <Toaster richColors={true} />
                {children}
            </body>
        </html>
    );
}