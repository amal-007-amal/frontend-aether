// components/TimePicker.tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { Label } from "../components/ui/label";

interface Time {
  h: string;
  m: string;
  s: string;
}

interface TimePickerProps {
  label?: string;
  value: Time;
  onChange: (value: Time) => void;
}

const pad = (val: number) => val.toString().padStart(2, "0");

export function AetherTimePicker({ label = "Select Time", value, onChange }: TimePickerProps) {
  const update = (part: keyof Time, val: string) => {
    onChange({ ...value, [part]: val });
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-normal">{label}</Label>
      <div className="flex gap-2">
        <Select value={value.h} onValueChange={(val) => update("h", val)}>
          <SelectTrigger className="w-full h-8 text-xs shadow-none">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 24 }, (_, i) => (
              <SelectItem key={i} value={pad(i)}>
                {pad(i)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={value.m} onValueChange={(val) => update("m", val)}>
          <SelectTrigger className="w-full h-8 text-xs shadow-none">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 60 }, (_, i) => (
              <SelectItem key={i} value={pad(i)}>
                {pad(i)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={value.s} onValueChange={(val) => update("s", val)}>
          <SelectTrigger className="w-full h-8 text-xs shadow-none">
            <SelectValue placeholder="SS" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 60 }, (_, i) => (
              <SelectItem key={i} value={pad(i)}>
                {pad(i)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
