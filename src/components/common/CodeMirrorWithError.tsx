import { cn } from "@/lib/utils";
import CodeMirror, { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { FC, useState } from "react";
import { ZodError } from "zod";
type CodeMirrorWithErrorProps = {
  validateChange?: (value: string) => string;
  onChange?: (value: string) => void;
} & ReactCodeMirrorProps;

export const CodeMirrorWithError: FC<CodeMirrorWithErrorProps> = ({
  validateChange,
  onChange,
  ...props
}) => {
  const [error, setError] = useState<string | undefined>(undefined);
  return (
    <div className="flex flex-col w-full space-y-2">
      <CodeMirror
        {...props}
        onChange={(value) => {
          try {
            validateChange?.(value);
            onChange?.(value);
            setError(undefined);
          } catch (e) {
            if (e instanceof ZodError && e.errors.length > 0) {
              setError(e.errors[0]?.message);
            } else if (e instanceof Error) {
              setError(e.message);
            }
            onChange?.(value);
          }
        }}
      />
      {error !== undefined && (
        <p
          className={cn([
            "word-wrap",
            "text-xs",
            "text-red-500",
            "dark:text-red-400",
          ])}
        >
          {error}
        </p>
      )}
    </div>
  );
};
