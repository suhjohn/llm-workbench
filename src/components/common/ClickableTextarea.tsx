import { cn } from "@/lib/utils";
import { FC, useEffect, useState } from "react";
import { ZodError } from "zod";
import { AutoResizeTextarea, TextareaProps } from "./AutoResizeTextarea";

type ClickableTextarea = {
  value: string;
  parse?: (value: string) => string;
  placeholder?: string;
  description?: string;
  label?: string;
  onBlur?: (text: string) => void | Promise<void>;
  readOnly?: boolean;
  rootClassName?: string | string[];
  textAreaProps?: TextareaProps;
  buttonClassName?: string | string[];
};

export const ClickableTextarea: FC<ClickableTextarea> = ({
  value,
  readOnly,
  rootClassName,
  textAreaProps,
  buttonClassName,
  parse = (value) => value,
  placeholder,
  label,
  description,
  onBlur,
}) => {
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string | undefined>(value);
  const [error, setError] = useState<string | undefined>(undefined);
  useEffect(() => {
    setInputText(value);
  }, [value]);
  const onFinish = async () => {
    if (inputText === undefined) {
      return;
    }
    try {
      await onBlur?.(inputText);
      setError(undefined);
      setIsClicked(false);
    } catch (e) {
      if (e instanceof ZodError && e.errors.length > 0) {
        setError(e.errors[0]?.message);
      }
      if (e instanceof Error) {
        setError(e.message || "There is an error in the input.");
      }
    }
  };
  const isEmpty = inputText === "";
  return (
    <div className={cn(["flex", "flex-col", "h-full", rootClassName])}>
      {label !== undefined && (
        <p
          className={cn([
            "px-2",
            "text-xs",
            "text-zinc-500",
            "dark:text-zinc-400",
          ])}
        >
          {label}
        </p>
      )}
      {!isClicked && (
        <button
          onClick={() => {
            if (readOnly) {
              return;
            }
            setIsClicked(true);
          }}
          className={cn([
            "w-full",
            "px-3",
            "py-2",
            "rounded-md",
            "border",
            `text-left`,
            "hover:border-zinc-200",
            "dark:hover:border-zinc-600",
            "whitespace-pre-wrap",
            "min-h-8",
            "focus-visible:outline-1",
            "focus-visible:outline-blue-500",
            "text-sm",
            readOnly ? "cursor-not-allowed" : "cursor-text",
            buttonClassName,
            inputText === undefined || isEmpty
              ? ["text-zinc-500", "dark:text-zinc-400"]
              : [],
          ])}
        >
          <p>{isEmpty ? placeholder : inputText}</p>
        </button>
      )}
      {isClicked && (
        <AutoResizeTextarea
          className={cn([
            "w-full",
            "rounded-md",
            "px-2",
            "py-1",
            "min-h-8",
            "focus-visible:outline-1",
            "focus-visible:outline-blue-500",
            "text-sm",
          ])}
          autoFocus
          onBlur={() => {
            return onFinish();
          }}
          onKeyDown={async (e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              await onFinish();
            }
          }}
          value={inputText}
          onChange={(e) => {
            const text = e.target.value;
            try {
              setInputText(parse(text));
              setError(undefined);
            } catch (err) {
              setInputText(text);
              if (err instanceof ZodError && err.errors.length > 0) {
                setError(err.errors[0]?.message);
              }
              if (err instanceof Error) {
                setError(err.message || "There is an error in the input.");
              }
            }
          }}
          {...textAreaProps}
        />
      )}
      {error === undefined && description !== undefined && (
        <p
          className={cn([
            "w-full",
            "px-2",
            "text-xs",
            "text-zinc-500",
            "dark:text-zinc-400",
          ])}
        >
          {description}
        </p>
      )}
      {error !== undefined && (
        <p
          className={cn([
            "px-2",
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
