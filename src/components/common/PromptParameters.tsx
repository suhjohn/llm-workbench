import { OpenAIChatCompletionResource } from "@/fixtures/resources";
import { cn } from "@/lib/utils";
import {
  OpenAIChatCompletionPromptParametersSchema,
} from "@/types/resources/openai";
import { json } from "@codemirror/lang-json";

import { PromptTemplateType } from "@/types/prompt";
import { ResourceParameterKeyType } from "@/types/resources";
import { ParameterInputSchema } from "@/types/resources/common";
import { PlusIcon } from "lucide-react";
import { FC } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { ClickableInput } from "./ClickableInput";
import { CodeMirrorWithError } from "./CodeMirrorWithError";
import { PromptParametersToolChoice } from "./PromptParametersToolChoice";
import { AutoResizeTextareaWithError } from "./TextareaWithError";

type PromptParametersProps = {
  template: PromptTemplateType;
  setTemplate: (template: PromptTemplateType) => void;
};

const resourceIdToParameterSchema = {
  [OpenAIChatCompletionResource.id]: OpenAIChatCompletionPromptParametersSchema,
};

export const PromptParameters: FC<PromptParametersProps> = ({
  template,
  setTemplate,
}) => {
  const {
    llmParameters: savedParameters,
    enabledParameters,
    resourceId,
  } = template;
  const resourceParameterSchema = resourceIdToParameterSchema[resourceId];
  if (resourceParameterSchema === undefined) {
    throw new Error(`No schema found for resource ${resourceId}`);
  }
  const setParameters = (parameters: object) => {
    setTemplate({
      ...template,
      llmParameters: parameters,
    });
  };

  const handleCheckboxChange = (
    key: ResourceParameterKeyType,
    checked: boolean,
    defaultValue?: any
  ) => {
    if (checked) {
      const dedupedEnabledParameters = Array.from(
        new Set([...enabledParameters, key])
      );
      const value =
        defaultValue !== undefined
          ? defaultValue
          : savedParameters[key] !== undefined
          ? savedParameters[key]
          : resourceParameterSchema[key].default;
      setTemplate({
        ...template,
        llmParameters: {
          ...savedParameters,
          [key]: value,
        },
        enabledParameters: dedupedEnabledParameters,
      });
    } else {
      setTemplate({
        ...template,
        enabledParameters: enabledParameters.filter((k) => k !== key),
      });
    }
  };
  const resourceParameters = Object.keys(resourceParameterSchema);
  return (
    <div className="space-y-4">
      {resourceParameters.map((resourceParameter) => {
        const typedKey = resourceParameter as ResourceParameterKeyType;
        const parameterSchema = resourceParameterSchema[typedKey];

        const parsedDefinition = ParameterInputSchema.parse(parameterSchema);
        const defaultValue = parsedDefinition.default;
        const checked = enabledParameters.includes(typedKey);
        const value = savedParameters[typedKey] ?? defaultValue;
        return (
          <div className="flex space-x-4 flex-col" key={resourceParameter}>
            {/** First row of a parameter */}
            <div className="flex space-x-4 items-center">
              <Checkbox
                checked={checked}
                onCheckedChange={(checked) => {
                  handleCheckboxChange(typedKey, checked === true);
                }}
              />
              <div className={cn("w-full space-y-2", !checked && "opacity-25")}>
                {parsedDefinition.type === "slider" && (
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={() => {
                        handleCheckboxChange(typedKey, !checked);
                      }}
                      variant="unstyled"
                      className="p-0"
                    >
                      {resourceParameter}
                    </Button>
                    {typeof value === "number" && (
                      <ClickableInput
                        value={value.toString()}
                        parse={(value) => {
                          parsedDefinition.parse(value);
                          return value;
                        }}
                        placeholder={value.toString()}
                        rootClassName="w-48"
                        onClick={() => {
                          if (!checked) {
                            handleCheckboxChange(typedKey, !checked);
                          }
                        }}
                        onBlur={(value) => {
                          setParameters({
                            ...savedParameters,
                            [resourceParameter]: parsedDefinition.parse(value),
                          });
                        }}
                      />
                    )}
                  </div>
                )}
                {parsedDefinition.type === "textarea" && (
                  <Button
                    onClick={() => {
                      handleCheckboxChange(typedKey, !checked);
                    }}
                    variant="unstyled"
                    className="p-0"
                  >
                    {resourceParameter}
                  </Button>
                )}
                {parsedDefinition.type === "json" && (
                  <Button
                    onClick={() => {
                      handleCheckboxChange(typedKey, !checked);
                    }}
                    variant="unstyled"
                    className="p-0"
                  >
                    {resourceParameter}
                  </Button>
                )}
                {parsedDefinition.type === "switch" && (
                  <div className="flex justify-between">
                    <Button
                      onClick={() => {
                        handleCheckboxChange(typedKey, !checked);
                      }}
                      variant="unstyled"
                      className="p-0"
                    >
                      {resourceParameter}
                    </Button>
                    <Switch
                      checked={value === true}
                      onClick={() => {
                        if (!checked) {
                          handleCheckboxChange(typedKey, !checked);
                        }
                      }}
                      onCheckedChange={(checked) => {
                        setParameters({
                          ...savedParameters,
                          [resourceParameter]: checked,
                        });
                      }}
                    />
                  </div>
                )}
                {parsedDefinition.type === "input" && (
                  <div className="flex justify-between items-center space-x-4">
                    <Button
                      onClick={() => {
                        handleCheckboxChange(typedKey, !checked);
                      }}
                      variant="unstyled"
                      className="p-0"
                    >
                      {resourceParameter}
                    </Button>
                  </div>
                )}
                {parsedDefinition.type === "tools" && (
                  <div className="flex justify-between items-center space-x-4">
                    <Button
                      onClick={() => {
                        handleCheckboxChange(typedKey, !checked);
                      }}
                      variant="unstyled"
                      className="p-0"
                    >
                      {resourceParameter}
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => {
                        if (!checked) {
                          handleCheckboxChange(typedKey, !checked);
                        }
                        const data = parsedDefinition.parse(value);
                        if (Array.isArray(data)) {
                          setParameters({
                            ...savedParameters,
                            [resourceParameter]: [
                              ...data,
                              {
                                type: "function",
                                function: {
                                  description: "",
                                  name: "function_name",
                                  parameters: {},
                                },
                              },
                            ],
                          });
                        } else {
                          setParameters({
                            ...savedParameters,
                            [resourceParameter]: [
                              {
                                type: "function",
                                function: {
                                  description: "",
                                  name: "",
                                  parameters: {},
                                },
                              },
                            ],
                          });
                        }
                      }}
                    >
                      <PlusIcon size="16" />
                      <p>Add Tool</p>
                    </Button>
                  </div>
                )}
                {parsedDefinition.type === "tool_choice" && (
                  <div className="flex justify-between items-center space-x-4">
                    <Button
                      onClick={() => {
                        handleCheckboxChange(typedKey, !checked);
                      }}
                      variant="unstyled"
                      className="p-0"
                    >
                      {resourceParameter}
                    </Button>
                  </div>
                )}
                {parsedDefinition.type === "select" && (
                  <div>
                    <Button
                      onClick={() => {
                        handleCheckboxChange(typedKey, !checked);
                      }}
                      variant="unstyled"
                      className="p-0"
                    >
                      {resourceParameter}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {/** Second row of a parameter */}
            <div
              className={cn("w-auto space-y-2 flex", !checked && "opacity-50")}
            >
              <div className="w-4" />
              {parsedDefinition.type === "slider" && (
                <Slider
                  onClick={() => {
                    if (!checked) {
                      handleCheckboxChange(typedKey, !checked);
                    }
                  }}
                  min={parsedDefinition.min}
                  max={parsedDefinition.max}
                  step={0.01}
                  value={[value] as [number]}
                  onValueChange={(value) => {
                    setParameters({
                      ...savedParameters,
                      [resourceParameter]: value[0],
                    });
                  }}
                />
              )}
              {parsedDefinition.type === "textarea" && (
                <AutoResizeTextareaWithError
                  value={JSON.stringify(value, null, 2)}
                  disabled={!checked}
                  onClick={() => {
                    if (!checked) {
                      handleCheckboxChange(typedKey, !checked);
                    }
                  }}
                  validateChange={(value) => {
                    parsedDefinition.parse(JSON.parse(value));
                  }}
                  onChange={(event) => {
                    const parsedValue = JSON.parse(event.target.value);
                    setParameters({
                      ...savedParameters,
                      [resourceParameter]: parsedValue,
                    });
                  }}
                />
              )}
              {parsedDefinition.type === "json" && (
                <CodeMirrorWithError
                  readOnly={!checked}
                  className="w-full"
                  onClick={() => {
                    if (!checked) {
                      handleCheckboxChange(typedKey, !checked);
                    }
                  }}
                  validateChange={(value) => {
                    parsedDefinition.parse(JSON.parse(value));
                    return value;
                  }}
                  onChange={(value) => {
                    setParameters({
                      ...savedParameters,
                      [resourceParameter]: value,
                    });
                  }}
                  value={
                    typeof value === "string"
                      ? value
                      : JSON.stringify(value, null, 2)
                  }
                  extensions={[json()]}
                />
              )}
              {parsedDefinition.type === "input" && (
                <Input
                  value={value.toString()}
                  onClick={() => {
                    if (!checked) {
                      if (!checked) {
                        handleCheckboxChange(typedKey, !checked);
                      }
                    }
                  }}
                  type={parsedDefinition.inputType}
                  onChange={(event) => {
                    if (parsedDefinition.inputType === "number") {
                      setParameters({
                        ...savedParameters,
                        [resourceParameter]: Number(event.target.value),
                      });
                    } else {
                      setParameters({
                        ...savedParameters,
                        [resourceParameter]: event.target.value,
                      });
                    }
                  }}
                />
              )}
              {parsedDefinition.type === "tools" && (
                <CodeMirrorWithError
                  readOnly={!checked}
                  className="w-full"
                  onClick={() => {
                    if (!checked) {
                      handleCheckboxChange(typedKey, !checked);
                    }
                  }}
                  validateChange={(value) => {
                    parsedDefinition.parse(JSON.parse(value));
                    return value;
                  }}
                  onChange={(value) => {
                    const parsedValue = JSON.parse(value);
                    setParameters({
                      ...savedParameters,
                      [resourceParameter]: parsedValue,
                    });
                  }}
                  value={JSON.stringify(value, null, 2)}
                  extensions={[json()]}
                />
              )}
              {parsedDefinition.type === "tool_choice" &&
                (typeof value === "string" || typeof value === "object") && (
                  <PromptParametersToolChoice
                    value={value}
                    checked={checked}
                    onChange={(toggleType, value) => {
                      if (toggleType === "string") {
                        setParameters({
                          ...savedParameters,
                          [resourceParameter]: value,
                        });
                      }
                      if (toggleType === "object") {
                        setParameters({
                          ...savedParameters,
                          [resourceParameter]: JSON.parse(value),
                        });
                      }
                    }}
                  />
                )}
              {parsedDefinition.type === "select" && (
                <Select
                  value={value as string}
                  onValueChange={(value) => {
                    setParameters({
                      ...savedParameters,
                      [resourceParameter]: value,
                    });
                  }}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {parsedDefinition.choices.map((choice) => (
                      <SelectItem key={choice.name} value={choice.name}>
                        {choice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
