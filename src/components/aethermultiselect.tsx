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
  CommandEmpty,
} from "../components/ui/command";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { ChevronsUpDown } from "lucide-react";

type MultiSelectOption = {
  label: string;
  value: string;
};

type DynamicMultiSelectProps = {
  data: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
};

export function AetherMultiSelect({
  data,
  selected,
  onChange,
  placeholder = "Search users...",
}: DynamicMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleSelectAll = () => {
    const allValues = data.map((item) => item.value);
    onChange(allValues);
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const selectedLabels = data
    .filter((item) => selected.includes(item.value))
    .map((item) => item.label)
    .join(", ");

  const selectedCount = selected.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[300px] justify-between text-gray-500 font-normal text-xs shadow-none"
        >
          {selectedCount === data.length
            ? "All Users Selected"
            : selectedCount > 1
              ? `${selectedCount} selected`
              : selectedLabels || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No results found.</CommandEmpty>
          <div className="flex justify-between items-center px-3 py-2 text-xs border-b">
            <button onClick={handleSelectAll} className="hover:underline">
              Select All
            </button>
            <div className="flex gap-2">
              <button onClick={handleDeselectAll} className="text-red-600 hover:underline">
                Clear All
              </button>
              <button onClick={()=>{setOpen(prev=>!prev)}} className="text-blue-600 hover:underline">
                Apply
              </button>
            </div>
          </div>
          <CommandList>
            {data.map((item) => (
              <CommandItem key={item.value} onSelect={() => toggle(item.value)}>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selected.includes(item.value)}
                    onCheckedChange={() => toggle(item.value)}
                  />
                  <span className="text-xs">{item.label}</span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
