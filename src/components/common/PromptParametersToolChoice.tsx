import { OpenAIChatCompletionToolChoiceObjectSchema } from "@/types/resources/openai";
import { json } from "@codemirror/lang-json";
import { FC, useState } from "react";
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
  value: string | object;
  checked: boolean;
  onChange: (toggleType: "string" | "object", value: string) => void;
};

export const PromptParametersToolChoice: FC<
  PromptParametersToolChoiceProps
> = ({ value, checked, onChange }) => {
  const [toggleType, setToggleType] = useState<"string" | "object">("string");

  return (
    <div className="w-full flex flex-col items-start gap-2">
      <ToggleGroup
        type="single"
        value={toggleType}
        onValueChange={(newToggleType) => {
          if (newToggleType === toggleType) return;
          if (newToggleType === "") return;
          if (newToggleType === "string") {
            onChange(newToggleType, "auto");
          } else {
            onChange(
              newToggleType as typeof toggleType,
              `{ "type": "function", "function": { "name": "" } }`
            );
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
          value={JSON.stringify(value, null, 2)}
          extensions={[json()]}
        />
      )}
    </div>
  );
};
