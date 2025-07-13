import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "../components/ui/command";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { ChevronsUpDown } from "lucide-react";

type AetherAdderMultiSelectProps = {
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
};

export function AetherAdderMultiSelect({
  selected,
  onChange,
  placeholder = "Other number...",
}: AetherAdderMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const isValidNumber = (val: string) => /^\d+$/.test(val.trim());

  const handleAdd = (value: string) => {
    const trimmed = value.trim();
    if (isValidNumber(trimmed) && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setInputValue("");
    }
  };

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd(inputValue);
    }
  };

  return (
    <div className="w-full max-w-md space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[300px] justify-between text-xs text-gray-500 shadow-none"
          >
            {selected.length > 0
              ? `${selected.length} selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Enter number"
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleKeyDown}
              className="text-xs w-full"
            />
            <CommandList>
              {isValidNumber(inputValue) && !selected.includes(inputValue.trim()) && (
                <CommandItem onSelect={() => handleAdd(inputValue.trim())}>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={false} />
                    <span className="text-xs p-2 cursor-pointer">Add "{inputValue.trim()}"</span>
                  </div>
                </CommandItem>
              )}

              {selected.map((val) => (
                <CommandItem key={val} onSelect={() => handleToggle(val)}>
                  <div className="flex items-center gap-2 w-full">
                    <Checkbox checked={true} />
                    <span className="text-xs cursor-pointer">{val}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
