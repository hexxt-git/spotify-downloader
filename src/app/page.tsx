import DownloadForm from "../components/DownloadForm";
import { Info } from "@/components/Info"

export default function Home() {
    return (
        <main className="min-h-screen text-white flex flex-col items-center justify-center p-4 lg:p-12">
            <div className="absolute top-4 right-4">
                <Info />
            </div>
            <DownloadForm />
        </main>
    );
}
