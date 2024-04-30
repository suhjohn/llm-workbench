import * as React from "react";
import TextareaAutosize from "react-textarea-autosize";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxRows?: number;
  minRows?: number;
}

const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxRows, minRows, style, ...props }, ref) => {
    // Prepare combined styles
    const combinedStyles = { ...style };
    if (combinedStyles.height !== undefined) {
      combinedStyles.height = Number(combinedStyles.height);
    }

    return (
      <TextareaAutosize
        className={cn(
          [
            "flex",
            "min-h-[80px]",
            "w-full",
            "rounded-md",
            "border",
            "border-input",
            "bg-background",
            "px-3",
            "py-2",
            "text-sm",
            "ring-offset-background",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-ring",
            "focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
          ],
          className
        )}
        style={combinedStyles}
        ref={ref}
        maxRows={maxRows}
        minRows={minRows}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = "Textarea";

export { AutoResizeTextarea };
