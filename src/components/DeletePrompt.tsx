import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash, ArrowUpToLine, ArrowDownToLine, X } from "lucide-react";

interface DeletePromptProps {
    index: number;
    isOpen: boolean;
    onClose: () => void;
    onDelete: (index: number, mode: "single" | "above" | "below") => void;
    trackName: string;
}

export function DeletePrompt({ index, isOpen, onClose, onDelete, trackName }: DeletePromptProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-gray-900 border border-red-500/30">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Trash className="w-6 h-6 text-red-500" />
                        Delete Track
                    </DialogTitle>
                    <DialogDescription className="text-gray-100 text-lg">
                        Are you sure you want to delete "{trackName}"?
                    </DialogDescription>
                    <DialogDescription className="text-gray-400 !mt-0">
                        hold shift to delete instantly next time
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <Button
                            variant="destructive"
                            onClick={() => onDelete(index, "single")}
                            className="w-full bg-red-600 hover:bg-red-700">
                            <Trash className="w-4 h-4 mr-2" />
                            Delete This Track
                        </Button>
                    </div>

                    <Button
                        variant="destructive"
                        onClick={() => onDelete(index, "above")}
                        className="w-full bg-red-600 hover:bg-red-700">
                        <ArrowUpToLine className="w-4 h-4 mr-2" />
                        Delete All Above
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={() => onDelete(index, "below")}
                        className="w-full bg-red-600 hover:bg-red-700">
                        <ArrowDownToLine className="w-4 h-4 mr-2" />
                        Delete All Below
                    </Button>

                    <div className="col-span-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="w-full border-gray-700 hover:bg-gray-800 text-gray-300">
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
