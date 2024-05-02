"use client";
import { useResources } from "@/hooks/useResources";
import { getVariables } from "@/lib/parser";
import { ChatMessage } from "@/types/chat";
import { PromptTemplateType } from "@/types/prompt";
import { json } from "@codemirror/lang-json";
import { ChevronLeft } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { FC } from "react";
import { ClickableInput } from "./common/ClickableInput";
import { CodeMirrorWithError } from "./common/CodeMirrorWithError";
import { PromptInput } from "./common/PromptInput";
import { PromptParameters } from "./common/PromptParameters";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
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
  promptParameters: Record<string, any>;
  setPromptParameters: (parameters: Record<string, any>) => void;
  onClickBack?: () => void;
};

export const TemplateSection: FC<TemplateSection> = ({
  template: templateObj,
  setTemplate,
  promptParameters,
  setPromptParameters,
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

  const selectedParameters = enabledParameters.reduce((acc, key) => {
    acc[key] = llmParameters[key];
    return acc;
  }, {} as Record<string, any>);
  const selectedResource = resources.find((r) => r.id === resourceId);

  const completionType = selectedResource?.completionType;

  const getVariablesFromParameters = (parser: string) => {
    if (messagesTemplate !== undefined && messagesTemplate !== null) {
      const variables = new Set<string>();
      messagesTemplate?.forEach((message) => {
        getVariables(parser, message.content).forEach((variable) => {
          variables.add(variable);
        });
      });
      return Array.from(variables);
    }
    if (promptTemplate !== undefined && promptTemplate !== null) {
      return getVariables(parser, promptTemplate);
    }
    return [];
  };

  const handleSetPromptTemplate = (newPromptTemplate: string) => {
    setTemplate({
      ...templateObj,
      promptTemplate: newPromptTemplate,
    });
    const newVariables = getVariablesFromParameters("mustache");
    const newPromptParameters = newVariables.reduce((acc, variable) => {
      acc[variable] = "";
      return acc;
    }, {} as Record<string, any>);
    const allNewPromptParameters = {
      ...newPromptParameters,
      ...promptParameters,
    };
    setPromptParameters(allNewPromptParameters);
  };

  const handleSetMessagesTemplate = (newMessagesTemplate: ChatMessage[]) => {
    setTemplate({
      ...templateObj,
      messagesTemplate: newMessagesTemplate,
    });
    const newVariables = getVariablesFromParameters("mustache");
    const newPromptParameters = newVariables.reduce((acc, variable) => {
      acc[variable] = "";
      return acc;
    }, {} as Record<string, any>);
    const allNewPromptParameters = {
      ...newPromptParameters,
      ...promptParameters,
    };
    setPromptParameters(allNewPromptParameters);
  };

  return (
    <div className="w-full flex flex-col space-y-2 h-full overflow-auto">
      <div className="flex justify-between space-x-2">
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
        <Select
          value={resourceId}
          onValueChange={(value) => {
            setTemplate({
              ...templateObj,
              resourceId: value,
            });
          }}
        >
          <SelectTrigger className="w-64 flex-shrink-0">
            <SelectValue>
              {selectedResource?.name || "Select a resource"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {resources.map((resource) => (
              <SelectItem key={resource.id} value={resource.id}>
                {resource.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader className="w-auto block">
          {completionType === "completion" && <Label>Prompt Template</Label>}
          {completionType === "chat" && <Label>Messages Template</Label>}
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
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      <Card>
        <Tabs defaultValue="ui">
          <CardHeader className="w-auto block">
            <Label>Model Parameters</Label>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Tabs>
        <CardFooter />
      </Card>
    </div>
  );
};
