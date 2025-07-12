import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { Input } from "./ui/input";

export const AetherPagination = ({
    currentOffset,
    total,
    limit,
    setLimit,
    setCurrentOffset,
}: {
    currentOffset: number;
    total: number;
    limit: number;
    setLimit: (value: number) => void;
    setCurrentOffset: (value: number) => void;
}) => {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (currentOffset - 1) * limit + 1;
    const end = Math.min(start + limit - 1, total);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-end mt-4 gap-4 text-sm">

            <div className="flex items-center gap-2">
                <span className="text-xs">Page</span>
                <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentOffset}
                    onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (!isNaN(page)) {
                            setCurrentOffset(Math.min(Math.max(1, page), totalPages));
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            const page = parseInt(e.currentTarget.value);
                            if (!isNaN(page)) {
                                setCurrentOffset(Math.min(Math.max(1, page), totalPages));
                            }
                        }
                    }}
                    className="w-20 h-8 text-center text-xs rounded-xl"
                />
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs">Rows per page</span>
                <Select
                    value={String(limit)}
                    onValueChange={(val) => {
                        setLimit(Number(val));
                        setCurrentOffset(1);
                    }}
                >
                    <SelectTrigger className="w-24 h-8 text-xs rounded-xl">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[10].map((num) => (
                            <SelectItem key={num} value={String(num)}>
                                {num}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="text-xs text-center">
                    {start} - {end} of {total}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentOffset(Math.max(1, currentOffset - 1))}
                    disabled={currentOffset === 1}
                    className="text-xs"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentOffset(Math.min(totalPages, currentOffset + 1))}
                    disabled={currentOffset === totalPages}
                    className="text-xs"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
