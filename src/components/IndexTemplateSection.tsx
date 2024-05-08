"use client";
import { OpenAIChatCompletionResource } from "@/fixtures/resources";
import { useGetVariablesCallback } from "@/hooks/useGetVariables";
import { useResources } from "@/hooks/useResources";
import { ChatMessage } from "@/types/chat";
import { PromptTemplateType } from "@/types/prompt";
import { json } from "@codemirror/lang-json";
import { ChevronLeft } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { FC, useState } from "react";
import { ClickableInput } from "./common/ClickableInput";
import { CodeMirrorWithError } from "./common/CodeMirrorWithError";
import { PromptInput } from "./common/PromptInput";
import { PromptParameters } from "./common/PromptParameters";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type TemplateSection = {
  template: PromptTemplateType;
  setTemplate: (template: PromptTemplateType) => void;
  onClickBack?: () => void;
};

export const TemplateSection: FC<TemplateSection> = ({
  template: templateObj,
  setTemplate,
  onClickBack,
}) => {
  const {
    name: templateName,
    resourceId,
    llmParameters,
    promptTemplate,
    messagesTemplate,
    enabledParameters,
  } = templateObj;
  const { data: resources } = useResources();
  const { resolvedTheme } = useTheme();
  const [promptParameters, setPromptParameters] = useState<string[]>([]);
  const [promptParametersError, setPromptParametersError] = useState<
    string | undefined
  >(undefined);
  const selectedParameters = enabledParameters.reduce((acc, key) => {
    acc[key] = llmParameters[key];
    return acc;
  }, {} as Record<string, any>);
  const selectedResource = resources.find((r) => r.id === resourceId);

  const completionType = selectedResource?.completionType;

  const getVariablesFromParameters = useGetVariablesCallback();

  const handleSetPromptTemplate = (newPromptTemplate: string) => {
    setTemplate({
      ...templateObj,
      promptTemplate: newPromptTemplate,
    });
    try {
      const newPromptParameters = getVariablesFromParameters({
        promptTemplate: newPromptTemplate,
        messagesTemplate: undefined,
        parser: "mustache",
      });
      setPromptParameters(newPromptParameters);
      setPromptParametersError(undefined);
    } catch (e) {
      if (e instanceof Error) {
        console.error(`Error while setting prompt parameters: ${e.message}`);
        setPromptParametersError(
          `Error while setting prompt parameters: ${e.message}`
        );
      }
    }
  };

  const handleSetMessagesTemplate = (newMessagesTemplate: ChatMessage[]) => {
    setTemplate({
      ...templateObj,
      messagesTemplate: newMessagesTemplate,
    });
    try {
      const newPromptParameters = getVariablesFromParameters({
        promptTemplate: undefined,
        messagesTemplate: newMessagesTemplate,
        parser: "mustache",
      });
      setPromptParameters(newPromptParameters);
      setPromptParametersError(undefined);
    } catch (e) {
      if (e instanceof Error) {
        console.error(`Error while setting prompt parameters: ${e.message}`);
        setPromptParametersError(
          `Error while setting prompt parameters: ${e.message}`
        );
      }
    }
  };

  return (
    <div className="flex w-full flex-col space-y-2 h-full overflow-auto">
      <div className="flex justify-between flex-col md:flex-row gap-2">
        <div className="flex justify-between w-full space-x-2">
          <Button
            className="px-2 py-2 h-auto"
            onClick={onClickBack}
            variant={"ghost"}
          >
            <ChevronLeft size={16} />
          </Button>
          <ClickableInput
            rootClassName="w-full"
            value={templateName}
            placeholder="Input a template name..."
            onBlur={(value) => {
              setTemplate({
                ...templateObj,
                name: value,
              });
            }}
            parse={(value) => value}
          />
        </div>
        <Select
          value={resourceId}
          onValueChange={(value) => {
            setTemplate({
              ...templateObj,
              resourceId: value,
            });
          }}
        >
          <SelectTrigger className="w-full md:w-64 flex-shrink-0">
            <SelectValue>
              {selectedResource?.name || "Select a resource"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {[OpenAIChatCompletionResource].map((resource) => (
              <SelectItem key={resource.id} value={resource.id}>
                {resource.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Accordion
        type="multiple"
        defaultValue={["prompt", "parameters"]}
        className="w-full px-0 md:px-2"
      >
        <AccordionItem value="prompt">
          <AccordionTrigger>
            {completionType === "completion" && <Label>Prompt Template</Label>}
            {completionType === "chat" && <Label>Messages Template</Label>}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Use mustache syntax to define variables. e.g.
                  {"Respond to the user's message: {{ user_input }}"}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">{`Learn more at: `}</span>
                  <Link
                    href="https://github.com/janl/mustache.js"
                    className="text-blue-500 hover:underline"
                    target="_blank"
                  >
                    https://github.com/janl/mustache.js
                  </Link>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <PromptInput
                  completionPromptProps={
                    completionType === "completion"
                      ? {
                          value: promptTemplate,
                          onChange: handleSetPromptTemplate,
                        }
                      : undefined
                  }
                  chatPromptProps={
                    completionType === "chat"
                      ? {
                          value: messagesTemplate,
                          onChange: handleSetMessagesTemplate,
                        }
                      : undefined
                  }
                />
                <div className="flex gap-2 items-center">
                  {promptParametersError && (
                    <p className="text-red-500 text-sm">
                      {promptParametersError}
                    </p>
                  )}
                  {promptParametersError === undefined && (
                    <>
                      <span className="text-muted-foreground text-sm">
                        Variables:
                      </span>
                      {promptParameters.length === 0 && (
                        <span className="italic text-muted-foreground text-sm">
                          No variables found.
                        </span>
                      )}
                      {promptParameters.map((parameter) => (
                        <Badge key={parameter} variant={"secondary"}>
                          {parameter}
                        </Badge>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="parameters">
          <AccordionTrigger>
            <Label>Model Parameters</Label>
          </AccordionTrigger>
          <AccordionContent>
            <Tabs defaultValue="ui">
              <TabsList>
                <TabsTrigger value="ui">UI</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="ui">
                <PromptParameters
                  template={templateObj}
                  setTemplate={setTemplate}
                />
              </TabsContent>
              <TabsContent value="json">
                <CodeMirrorWithError
                  readOnly={true}
                  className="w-full"
                  theme={resolvedTheme === "dark" ? "dark" : "light"}
                  value={JSON.stringify(selectedParameters, null, 2)}
                  extensions={[json()]}
                />
              </TabsContent>
            </Tabs>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
