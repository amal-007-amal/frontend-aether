import {
    Popover,
    PopoverContent,
} from "../components/ui/popover";
import {
    Command,
    CommandInput,
    CommandList,
} from "../components/ui/command";
import { Checkbox } from "../components/ui/checkbox";
import { useEffect, useState } from "react";

type MultiSelectOption = {
    label: string;
    value: string;
};

type DynamicMultiSelectProps = {
    data: MultiSelectOption[];         // label = name, value = id (unused)
    selected: string[];                // selected names (label)
    onChange: (selected: string[]) => void;
    open: boolean;
    setOpen: (value: boolean) => void;
};

export function AetherNameMultiSelect({
    data,
    selected,
    onChange,
    open,
    setOpen,
}: DynamicMultiSelectProps) {
    const [tempSelected, setTempSelected] = useState<string[]>(selected);

    useEffect(() => {
        if (open) {
            setTempSelected(selected); // sync when dropdown opens
        }
    }, [open, selected]);

    const toggle = (value: string) => {
        setTempSelected((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
    };

    const handleSelectAll = () => {
        const allLabels = data.map((item) => item.label);
        setTempSelected(allLabels);
    };

    const handleDeselectAll = () => {
        setTempSelected([]);
    };

    const handleApply = () => {
        onChange(tempSelected); // update parent only on apply
        setOpen(false);
    };

    const selectedLabels = tempSelected.join(", ");
    const selectedCount = tempSelected.length;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverContent className="w-[300px] p-0 absolute top-44 left-24">
                <Command>
                    <CommandInput
                        placeholder={
                            selectedCount > 2
                                ? `${selectedCount} people`
                                : selectedLabels || "Search..."
                        }
                    />
                    <div className="flex justify-between items-center px-3 py-2 text-xs border-b">
                        <div className="gap-4 flex">
                            <button
                                onClick={handleSelectAll}
                                className="text-black hover:underline"
                            >
                                Select All
                            </button>
                            <button
                                onClick={handleDeselectAll}
                                className="text-red-600 hover:underline"
                            >
                                Clear All
                            </button>
                        </div>
                        <button
                            onClick={handleApply}
                            className="text-blue-600 hover:underline"
                        >
                            Apply
                        </button>
                    </div>

                    <CommandList>
                        {data.map((item) => (
                            <div
                                key={item.value}
                                className="px-2 py-1.5 cursor-pointer hover:bg-gray-100 flex items-center gap-2 text-sm"
                                onClick={() => toggle(item.label)}
                            >
                                <Checkbox
                                    checked={tempSelected.includes(item.label)}
                                    onCheckedChange={() => toggle(item.label)}
                                    onClick={(e) => e.stopPropagation()} // prevent double toggle
                                />
                                <span className="text-xs">{item.label}</span>
                            </div>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
