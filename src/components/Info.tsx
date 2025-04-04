"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Info as InfoIcon, Github } from "lucide-react";

export function Info() {
    const [isMobile, setIsMobile] = useState(false);

    // Check if we're on mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // 768px is typical mobile breakpoint
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const content = (
        <div className="space-y-6 text-left">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">How It Works</h3>
                <div>
                    This website is a Spotify playlist downloader that helps you get your spotify
                    music in mp3 format to save locally. this website is optimized for bulk
                    downloads and heavy use
                </div>

                <div className="space-y-2">
                    <h4 className="font-bold">1. Playlist Input</h4>
                    <div>
                        Simply paste a Spotify playlist link into the input field. The link should
                        look something like: https://open.spotify.com/playlist/...
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="font-bold">2. Track Loading</h4>
                    <div>
                        The system will load all tracks from your playlist, showing you the title,
                        artist, and duration of each song.
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="font-bold">3. Download Process</h4>
                    <div>When you click download, the system will:</div>
                    <ul className="list-disc pl-6">
                        <li>Search for the best matching audio for each track</li>
                        <li>Process the audio files to match the original quality</li>
                        <li>Package everything for download</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h4 className="font-bold">4. Get Your Music</h4>
                    <div>
                        Once processing is complete, you'll receive your tracks in high-quality MP3
                        format.
                    </div>
                </div>

                <div className="text-sm text-muted-foreground">
                    Note: This tool is for personal use only. Please respect copyright laws and
                    artists' rights when downloading music.
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Made By</h3>
                <div className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    <a
                        href="https://github.com/hexxt-git/spotify-downloader"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors">
                        @hexxt-git
                    </a>
                </div>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <Drawer>
                <DrawerTrigger asChild>
                    <Button variant="outline" className="relative gap-2 z-50">
                        <InfoIcon size={20} />
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>About This Website</DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4 pb-8">
                        <DrawerDescription>{content}</DrawerDescription>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <InfoIcon size={20} />
                    About
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>About This Website</DialogTitle>
                </DialogHeader>
                <DialogDescription>{content}</DialogDescription>
            </DialogContent>
        </Dialog>
    );
}
