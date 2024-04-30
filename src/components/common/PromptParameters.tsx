import { OpenAIChatCompletionResource } from "@/fixtures/resources";
import { cn } from "@/lib/utils";
import {
  LLMRequestBodySchema,
  OpenAIChatCompletionRenderSchema,
  OpenAIChatCompletionRequestBodySchema,
  RenderSchema,
} from "@/types/resource";
import { json } from "@codemirror/lang-json";

import { PlusIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { FC } from "react";
import { z } from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { ClickableInput } from "./ClickableInput";
import { CodeMirrorWithError } from "./CodeMirrorWithError";
import { PromptParametersToolChoice } from "./PromptParametersToolChoice";
import { AutoResizeTextareaWithError } from "./TextareaWithError";

type PromptParametersProps = {
  resourceId: string;
  parameters: z.infer<typeof LLMRequestBodySchema>;
  setParameters: (parameters: object) => void;
  enabledParameters: string[];
  setEnabledParameters: (enabledParameters: string[]) => void;
};

const resourceIdToSchema = {
  [OpenAIChatCompletionResource.id]: OpenAIChatCompletionRequestBodySchema,
};
const resourceIdToRenderSchema = {
  [OpenAIChatCompletionResource.id]: OpenAIChatCompletionRenderSchema,
};

export const PromptParameters: FC<PromptParametersProps> = ({
  resourceId,
  parameters,
  setParameters,
  enabledParameters,
  setEnabledParameters,
}) => {
  const { resolvedTheme } = useTheme();
  const resourceSchema = resourceIdToSchema[resourceId];
  const resourceRenderSchema = resourceIdToRenderSchema[resourceId];
  if (!resourceSchema || !resourceRenderSchema) {
    throw new Error(`No schema or definition found for resource ${resourceId}`);
  }
  if (
    Object.keys(resourceSchema.shape).length !==
    Object.keys(resourceRenderSchema).length
  ) {
    throw new Error(
      `Parameters length does not match definition length for resource ${resourceId}`
    );
  }
  const handleCheckboxChange = (
    key: keyof z.infer<typeof LLMRequestBodySchema>,
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
          : resourceRenderSchema[key].default;
      setEnabledParameters(dedupedEnabledParameters);
      setParameters({
        [key]: value,
        ...parameters,
      });
    } else {
      setEnabledParameters(enabledParameters.filter((k) => k !== key));
    }
  };
  return (
    <div className="space-y-4">
      {Object.entries(resourceRenderSchema).map(([key, definition]) => {
        const typedKey = key as keyof z.infer<typeof LLMRequestBodySchema>;
        const parsedDefinition = RenderSchema.parse(definition);
        const keySchema =
          resourceSchema.shape[key as keyof typeof resourceSchema.shape];
        if (!keySchema) {
          throw new Error(`No schema found for key ${key}`);
        }
        const defaultValue = parsedDefinition.default;
        const checked = enabledParameters.includes(key);
        const value = parameters[typedKey] ?? defaultValue;
        return (
          <div className="flex space-x-4 flex-col" key={key}>
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
                      {key}
                    </Button>
                    {typeof value === "number" && (
                      <ClickableInput
                        value={value.toString()}
                        parse={(value) => {
                          keySchema.parse(value);
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
                            ...parameters,
                            [key]: value,
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
                    {key}
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
                    {key}
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
                      {key}
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
                          ...parameters,
                          [key]: checked,
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
                      {key}
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
                      {key}
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => {
                        if (!checked) {
                          handleCheckboxChange(typedKey, !checked);
                        }
                        const { success, data } =
                          OpenAIChatCompletionRequestBodySchema.shape[
                            "tools"
                          ].safeParse(value);
                        if (success && Array.isArray(data)) {
                          setParameters({
                            ...parameters,
                            [key]: [
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
                            ...parameters,
                            [key]: [
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
                      {key}
                    </Button>
                  </div>
                )}
              </div>
            </div>
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
                      ...parameters,
                      [key]: value[0],
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
                    keySchema.parse(JSON.parse(value));
                  }}
                  onChange={(event) => {
                    const parsedValue = JSON.parse(event.target.value);
                    setParameters({
                      ...parameters,
                      [key]: parsedValue,
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
                    keySchema.parse(JSON.parse(value));
                    return value;
                  }}
                  onChange={(value) => {
                    const parsedValue = JSON.parse(value);
                    setParameters({
                      ...parameters,
                      [key]: parsedValue,
                    });
                  }}
                  theme={resolvedTheme === "dark" ? "dark" : "light"}
                  value={JSON.stringify(value, null, 2)}
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
                        ...parameters,
                        [key]: Number(event.target.value),
                      });
                    } else {
                      setParameters({
                        ...parameters,
                        [key]: event.target.value,
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
                    keySchema.parse(JSON.parse(value));
                    return value;
                  }}
                  onChange={(value) => {
                    const parsedValue = JSON.parse(value);
                    setParameters({
                      ...parameters,
                      [key]: parsedValue,
                    });
                  }}
                  theme={resolvedTheme === "dark" ? "dark" : "light"}
                  value={JSON.stringify(value, null, 2)}
                  extensions={[json()]}
                />
              )}
              {parsedDefinition.type === "tool_choice" &&
                (typeof value === "string" || typeof value === "object") && (
                  <PromptParametersToolChoice
                    typedKey={typedKey}
                    value={value}
                    checked={checked}
                    handleCheckboxChange={handleCheckboxChange}
                    onChange={(toggleType, value) => {
                      if (toggleType === "string") {
                        setParameters({
                          ...parameters,
                          [key]: value,
                        });
                      }
                      if (toggleType === "object") {
                        setParameters({
                          ...parameters,
                          [key]: JSON.parse(value),
                        });
                      }
                    }}
                  />
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
