import { cn } from "@/lib/utils";
import { FC, useState } from "react";
import { ZodError } from "zod";
import { AutoResizeTextarea, TextareaProps } from "./AutoResizeTextarea";

type AutoResizeTextareaWithError = {
  validateChange?: (value: string) => void;
  value: string;
} & TextareaProps;

export const AutoResizeTextareaWithError: FC<AutoResizeTextareaWithError> = ({
  validateChange,
  value,
  onChange,
  ...props
}) => {
  const [error, setError] = useState<string | undefined>(undefined);
  return (
    <div className="w-full flex flex-col space-y-2">
      <AutoResizeTextarea
        {...props}
        value={value}
        onChange={(e) => {
          const text = e.target.value;
          try {
            validateChange?.(text);
            onChange?.(e);
            setError(undefined);
          } catch (err) {
            onChange?.(e);
            if (err instanceof ZodError && err.errors.length > 0) {
              setError(err.errors[0]?.message);
            }
            if (err instanceof Error) {
              setError(err.message || "There is an error in the input.");
            }
          }
        }}
      />
      {error !== undefined && (
        <p className={cn(["text-xs", "text-red-500", "dark:text-red-400"])}>
          {error}
        </p>
      )}
    </div>
  );
};
