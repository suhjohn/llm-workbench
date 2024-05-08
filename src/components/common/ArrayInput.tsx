import { ChangeEvent, FC, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

function hasOnlyDigits(value: string) {
  // This regex checks for an optional single or double quote at the beginning,
  // followed by one or more digits, and ends with an optional single or double
  // quote that matches the opening quote.
  return /^["']?\d+["']?$/.test(value);
}

type ArrayInputProps = {
  value: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  onArrayChange: (array: (string | number)[]) => void;
};
export const ArrayInput: FC<ArrayInputProps> = ({
  value,
  readOnly,
  onChange,
  onArrayChange,
}): JSX.Element => {
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const tryParseInt = (value: string) => {
    const trimmed = value.trim();
    if (hasOnlyDigits(trimmed)) {
      if (
        // allow string numbers but default to number
        (trimmed[0] === "'" && trimmed[trimmed.length - 1] === "'") ||
        (trimmed[0] === '"' && trimmed[trimmed.length - 1] === '"')
      ) {
        return trimmed.slice(1, -1);
      }
      return Number(trimmed);
    }
    return trimmed;
  };
  const [array, setArray] = useState<(string | number)[]>(
    value.split(",").map((item) => tryParseInt(item))
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
    const newArray = event.target.value
      .split(",")
      .map((item) => tryParseInt(item));
    setArray(newArray);
    onArrayChange(newArray);
  };
  const isEmpty = value === "";
  return (
    <div className="flex flex-col items-center justify-center w-full text-primary font-normal">
      {!isClicked && (
        <button
          className={cn(
            "w-full",
            "px-2",
            "py-1",
            "rounded-md",
            "border-2",
            "justify-start",
            `text-left`,
            "border-transparent",
            "hover:border-gray-200",
            "dark:hover:border-gray-700",
            "min-h-8",
            "focus-visible:outline-0",
            "focus-visible:ring-0",
            "focus-visible:border-blue-500",
            "text-sm",
            isEmpty && ["text-gray-400", "dark:text-gray-500"]
          )}
          onClick={() => setIsClicked(true)}
        >
          <p className="text-sm text-left">
            {value === ""
              ? "e.g. choices, 0, message, content"
              : JSON.stringify(array, null, 2)}
          </p>
        </button>
      )}
      {isClicked && (
        <Input
          type="text"
          placeholder="e.g. choices, 0, message, content"
          aria-label="Array input"
          autoFocus
          value={value}
          onBlur={() => setIsClicked(false)}
          onChange={handleChange}
        />
      )}
    </div>
  );
};
