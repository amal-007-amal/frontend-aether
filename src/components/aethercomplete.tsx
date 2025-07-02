import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Input } from "../components/ui/input";
import { X } from "lucide-react";

type AutoCompleteProps<T> = {
    data: T[];
    displayKey: keyof T;
    onSelect: (items: T[]) => void;
    placeholder?: string;
    value?: string;
};

export function AetherAutoComplete<T extends Record<string, any>>({
    data,
    displayKey,
    onSelect,
    placeholder = "Search...",
    value = "",
}: AutoCompleteProps<T>) {
    const [inputValue, setInputValue] = useState(value);
    const [open, setOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<T[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dropdownStyles, setDropdownStyles] = useState({ top: 0, left: 0, width: 0 });

    const filteredData = useMemo(() => {
        if (!inputValue) return data;
        return data.filter((item) =>
            String(item[displayKey]).toLowerCase().includes(inputValue.toLowerCase())
        );
    }, [data, inputValue, displayKey]);

    const handleSelect = (item: T) => {
        const alreadySelected = selectedItems.some((selected) => selected.id === item.id);
        const updatedItems = alreadySelected
            ? selectedItems.filter((selected) => selected.id !== item.id)
            : [...selectedItems, item];

        setSelectedItems(updatedItems);
        setInputValue(updatedItems.map((i) => String(i[displayKey])).join(", ")); // ← update here
        onSelect(updatedItems);
    };

    const handleClear = () => {
        setInputValue("");
        setOpen(false);
        setSelectedItems([]);
        onSelect([]);
    };

    const handleSelectAll = () => {
        setSelectedItems(filteredData);
        onSelect(filteredData);
    };

    const handleDeselectAll = () => {
        setSelectedItems([]);
        onSelect([]);
    };

    const isSelected = (item: T) => selectedItems.some((selected) => selected.id === item.id);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node) &&
                !(e.target as HTMLElement).closest(".aether-autocomplete-portal")
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        if (open && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownStyles({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [open, inputValue]);

    const dropdown = open && filteredData.length > 0 && (
        <div
            className="absolute z-[9999] max-h-60 overflow-auto rounded-md border bg-white shadow-md text-sm"
            style={{
                position: "absolute",
                top: dropdownStyles.top,
                left: dropdownStyles.left,
                width: dropdownStyles.width,
            }}
        >
            <div className="flex justify-between px-3 py-2 border-b text-xs text-gray-600">
                <button onClick={handleSelectAll} className="hover:underline">Select All</button>
                <button onClick={handleDeselectAll} className="hover:underline">Deselect All</button>
            </div>
            {filteredData.map((item) => (
                <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`cursor-pointer px-3 py-2 hover:bg-muted ${isSelected(item) ? "bg-muted font-medium" : ""
                        }`}
                >
                    {String(item[displayKey])}
                </div>
            ))}
        </div>
    );

    return (
        <>
            <div ref={containerRef} className="relative w-full">
                <Input
                    value={inputValue}
                    placeholder={placeholder}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    className="pr-8"
                />
                {inputValue && (
                    <X
                        size={16}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-red-500"
                        onClick={handleClear}
                    />
                )}
            </div>
            {createPortal(dropdown, document.body)}
        </>
    );
}
