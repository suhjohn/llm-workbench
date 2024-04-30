import {
  LLMRequestBodySchema,
  OpenAIChatCompletionToolChoiceObjectSchema,
} from "@/types/resource";
import { json } from "@codemirror/lang-json";
import { useTheme } from "next-themes";
import { FC, useState } from "react";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { CodeMirrorWithError } from "./CodeMirrorWithError";

type PromptParametersToolChoiceProps = {
  typedKey: keyof z.infer<typeof LLMRequestBodySchema>;
  value: string | object;
  checked: boolean;
  handleCheckboxChange: (
    key: keyof z.infer<typeof LLMRequestBodySchema>,
    checked: boolean,
    defaultValue: string | object
  ) => void;
  onChange: (toggleType: "string" | "object", value: string) => void;
};

export const PromptParametersToolChoice: FC<
  PromptParametersToolChoiceProps
> = ({ typedKey, value, checked, handleCheckboxChange, onChange }) => {
  const { resolvedTheme } = useTheme();
  const [toggleType, setToggleType] = useState<"string" | "object">("string");

  return (
    <div className="w-full flex flex-col items-start gap-2">
      <ToggleGroup
        type="single"
        value={toggleType}
        onValueChange={(newToggleType) => {
          if (newToggleType === "string") {
            onChange(newToggleType, "auto");
            if (!checked) handleCheckboxChange(typedKey, true, "auto");
          } else {
            onChange(
              newToggleType as typeof toggleType,
              `{ "type": "function", "function": { "name": "" } }`
            );
            if (!checked)
              handleCheckboxChange(typedKey, true, {
                type: "function",
                function: { name: "" },
              });
          }
          setToggleType(newToggleType as typeof toggleType);
        }}
      >
        <ToggleGroupItem value="string" aria-label="Toggle string">
          string
        </ToggleGroupItem>
        <ToggleGroupItem value="object" aria-label="Toggle object">
          object
        </ToggleGroupItem>
      </ToggleGroup>
      {toggleType === "string" && typeof value === "string" && (
        <Select
          value={value}
          onValueChange={(value: string) => {
            onChange(toggleType, value);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue>{value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {["none", "auto", "required"].map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {toggleType === "object" && (
        <CodeMirrorWithError
          readOnly={!checked}
          className="w-full"
          validateChange={(value) => {
            OpenAIChatCompletionToolChoiceObjectSchema.parse(JSON.parse(value));
            return value;
          }}
          onChange={(value) => {
            onChange(toggleType, value);
          }}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          value={JSON.stringify(value, null, 2)}
          extensions={[json()]}
        />
      )}
    </div>
  );
};
