import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

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
    const start = total === 0 ? 0 : (currentOffset - 1) * limit + 1;
    const end = total === 0 ? 0 : Math.min(start + limit - 1, total);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-end mt-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
                <span className="text-xs">Page</span>
                <Select
                    value={String(currentOffset)}
                    onValueChange={(val) => setCurrentOffset(Number(val))}
                >
                    <SelectTrigger className="w-20 h-8 text-xs rounded-xl">
                        <SelectValue placeholder="Page" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <SelectItem key={page} value={String(page)}>
                                {page}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs">Rows per page</span>
                <Select
                    value={String(limit)}
                    onValueChange={(val) => {
                        const newLimit = Number(val);
                        const oldOffset = (currentOffset - 1) * limit;
                        const newOffset = Math.floor(oldOffset / newLimit) * newLimit;
                        const newPage = Math.floor(newOffset / newLimit) + 1;

                        setLimit(newLimit);
                        setCurrentOffset(newPage);
                    }}
                >
                    <SelectTrigger className="w-24 h-8 text-xs rounded-xl">
                        <SelectValue placeholder="Limit" />
                    </SelectTrigger>
                    <SelectContent>
                        {[10, 20, 50, 100].map((num) => (
                            <SelectItem key={num} value={String(num)}>
                                {num}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="text-xs text-center">
                    {start} – {end} of {total}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentOffset(Math.max(1, currentOffset - 1))}
                    disabled={currentOffset === 1 || total === 0}
                    className="text-xs"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentOffset(Math.min(totalPages, currentOffset + 1))}
                    disabled={currentOffset === totalPages || total === 0}
                    className="text-xs"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
