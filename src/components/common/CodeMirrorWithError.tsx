import { cn } from "@/lib/utils";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { xcodeLight } from "@uiw/codemirror-theme-xcode";
import CodeMirror, { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();
  return (
    <div className="flex flex-col w-full space-y-2 bg-accent rounded-md overflow-hidden">
      <CodeMirror
        theme={resolvedTheme === "dark" ? vscodeDark : xcodeLight}
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
