import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { FC, HTMLInputTypeAttribute, useEffect, useState } from "react";
import { ZodError } from "zod";

export type ClickableInput = {
  value: string;
  parse: (value: string) => string;
  placeholder?: string;
  description?: string;
  type?: HTMLInputTypeAttribute;
  label?: string;
  onClick?: () => void;
  onBlur?: (value: string) => void;
  rootClassName?: ClassValue[] | ClassValue;
  inputClassName?: ClassValue[] | ClassValue;
  buttonClassName?: ClassValue[] | ClassValue;
};

export const ClickableInput: FC<ClickableInput> = ({
  value,
  parse,
  placeholder,
  description,
  type = "text",
  label,
  onClick,
  onBlur,
  rootClassName,
  inputClassName,
  buttonClassName,
}) => {
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>(value);
  useEffect(() => {
    setInputText(value);
  }, [value]);
  const [error, setError] = useState<string | undefined>(undefined);
  const handleFinish = () => {
    setIsClicked(false);
    onBlur?.(inputText);
  };
  const isEmpty = inputText === "";
  
  return (
    <div className={cn(["flex", "flex-col", rootClassName])}>
      <label
        className={cn([
          "px-2",
          "text-xs",
          "text-gray-500",
          "dark:text-gray-400",
        ])}
      >
        {label}
      </label>
      {!isClicked && (
        <button
          onClick={() => {
            setIsClicked(true);
            onClick?.();
          }}
          className={cn([
            "px-2",
            "py-1",
            "rounded-md",
            "border",
            "justify-start",
            `text-left`,
            "border-transparent",
            "hover:border-gray-200",
            "dark:hover:border-gray-600",
            "min-h-8",
            "focus-visible:outline-0",
            "focus-visible:ring-0",
            "focus-visible:border-blue-500",
            "text-sm",
            isEmpty && ["text-gray-400", "dark:text-gray-500"],
            buttonClassName,
          ])}
        >
          <p>{isEmpty ? placeholder : inputText}</p>
        </button>
      )}
      {isClicked && (
        <input
          className={cn([
            "rounded-md",
            "px-2",
            "py-1",
            "min-h-8",
            "border",
            "ring-0",
            "outline-0",
            "focus-visible:outline-0",
            "focus-visible:ring-0",
            "focus-visible:border-blue-500",
            "text-sm",
            "bg-transparent",
            inputClassName,
          ])}
          autoFocus
          type={type}
          onBlur={() => handleFinish()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              handleFinish();
            }
          }}
          value={inputText}
          onChange={(event) => {
            try {
              setInputText(parse(event.target.value));
              setError(undefined);
            } catch (e) {
              setInputText(event.target.value);
              if (e instanceof ZodError && e.errors.length > 0) {
                setError(e.errors[0]?.message);
              }
            }
          }}
        />
      )}
      {error === undefined && description !== undefined && (
        <p
          className={cn([
            "word-wrap",
            "px-2",
            "text-xs",
            "text-gray-500",
            "dark:text-gray-400",
          ])}
        >
          {description}
        </p>
      )}
      {error !== undefined && (
        <p
          className={cn([
            "word-wrap",
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
