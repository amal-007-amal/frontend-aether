import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Input } from "../components/ui/input";
import { X } from "lucide-react";

type AutoCompleteProps<T> = {
    data: T[];
    displayKey: keyof T;
    onSelect: (item: T) => void;
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
    const containerRef = useRef<HTMLDivElement>(null);
    const [dropdownStyles, setDropdownStyles] = useState({ top: 0, left: 0, width: 0 });

    const filteredData = useMemo(() => {
        if (!inputValue) return [];
        return data.filter((item) =>
            String(item[displayKey]).toLowerCase().includes(inputValue.toLowerCase())
        );
    }, [data, inputValue, displayKey]);

    const handleSelect = (item: T) => {
        setInputValue(String(item[displayKey]));
        onSelect(item);
        setOpen(false);
    };

    const handleClear = () => {
        setInputValue("");
        setOpen(false);
    };

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
            {filteredData.map((item) => (
                <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="cursor-pointer px-3 py-2 hover:bg-muted"
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
