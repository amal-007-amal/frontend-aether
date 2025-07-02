import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Button } from "../components/ui/button";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

type DateRangePickerProps = {
    date: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
};

export function AetherDateRangePicker({ date, onChange }: DateRangePickerProps) {
    const [open, setOpen] = React.useState(false);

    const formattedDate =
        date?.from && date?.to
            ? `${format(date.from, "MMM d, yyyy")} - ${format(date.to, "MMM d, yyyy")}`
            : "Pick a date range";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formattedDate}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Calendar
                    mode="range"
                    selected={date}
                    onSelect={onChange}
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    );
}
