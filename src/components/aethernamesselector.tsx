import {
    useFloating,
    offset,
    flip,
    shift,
    autoUpdate,
} from "@floating-ui/react";
import {
    Command,
    CommandInput,
    CommandList,
} from "../components/ui/command";
import { Checkbox } from "../components/ui/checkbox";
import { useEffect, useState, useRef } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { cn } from "../lib/utils";

type MultiSelectOption = {
    label: string;
    value: string;
};

type DynamicMultiSelectProps = {
    data: MultiSelectOption[];
    selected: string[];
    onChange: (selected: string[]) => void;
    open: boolean;
    setOpen: (value: boolean) => void;
    referenceRef: React.RefObject<HTMLElement>;
};

export function AetherNameMultiSelect({
    data,
    selected,
    onChange,
    open,
    setOpen,
    referenceRef,
}: DynamicMultiSelectProps) {
    const [tempSelected, setTempSelected] = useState<string[]>(selected);
    const [searchTerm, setSearchTerm] = useState("");

    const { refs, floatingStyles, update } = useFloating({
        open,
        onOpenChange: setOpen,
        middleware: [offset({ mainAxis: 15, crossAxis: -25 }), flip(), shift()],
        placement: "bottom-start",
        whileElementsMounted: autoUpdate,
    });

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useClickOutside(dropdownRef, () => {
        if (open) setOpen(false);
    });

    useEffect(() => {
        update();
    }, [data, selected]);

    useEffect(() => {
        if (referenceRef.current) {
            refs.setReference(referenceRef.current);
        }
    }, [referenceRef]);

    const toggle = (value: string) => {
        setTempSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const handleToggleSelectAll = () => {
        if (tempSelected.length === data.length) {
            // Deselect all
            setTempSelected([]);
        } else {
            // Select all
            const allLabels = data.map((item) => item.label);
            setTempSelected(allLabels);
        }
    };

    const handleApply = () => {
        onChange(tempSelected);
        setOpen(false);
    };

    const selectedCount = tempSelected.length;
    const selectedLabels = tempSelected.join(", ");

    const filteredData = data.filter((item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div ref={refs.setReference} className="inline-block relative" />
            {open && (
                <div
                    ref={(node) => {
                        refs.setFloating(node);
                        dropdownRef.current = node;
                    }}
                    style={floatingStyles}
                    className={cn(
                        "absolute z-50 w-[250px] rounded border shadow-md p-0 text-sm transition-opacity duration-150 ease-in-out",
                        open ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                >
                    <Command>
                        <CommandInput
                            placeholder={
                                selectedCount > 2
                                    ? `${selectedCount} selected`
                                    : selectedLabels || "Search..."
                            }
                            className="font-normal"
                            onValueChange={setSearchTerm}
                        />

                        <div className="flex justify-between items-center px-3 py-2 text-xs border-b">
                            <div className="gap-4 flex">
                                <button onClick={handleToggleSelectAll} className="hover:underline font-normal">
                                    {tempSelected.length === data.length ? "Deselect All" : "Select All"}
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleApply}
                                    className="text-blue-600 hover:underline font-normal"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <CommandList>
                            {filteredData.length === 0 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    No results found
                                </div>
                            )}
                            {filteredData.sort((a, b) => a.label.localeCompare(b.label)).map((item) => (
                                <div
                                    key={item.value}
                                    className="px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-2"
                                    onClick={() => toggle(item.label)}
                                >
                                    <Checkbox
                                        checked={tempSelected.includes(item.label)}
                                        onCheckedChange={() => toggle(item.label)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="text-xs font-normal">{item.label}</span>
                                </div>
                            ))}
                        </CommandList>
                    </Command>
                </div>
            )}

        </>

    );
}
