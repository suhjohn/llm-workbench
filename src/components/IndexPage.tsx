"use client";
import { TopNavigation } from "@/components/common/TopNavigation";
import { OpenAIChatCompletionResource } from "@/fixtures/resources";
import { useCreateCompletion } from "@/hooks/useCreateCompletion";
import { useResources } from "@/hooks/useResources";
import { compile, getVariables } from "@/lib/parser";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";
import { LLMRequestBodySchemaType } from "@/types/resource";
import { json } from "@codemirror/lang-json";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo, useState } from "react";
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
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";

export default function HomePage() {
  const { data: resources } = useResources();
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();

  const [resourceId, setResourceId] = useState<string>(
    OpenAIChatCompletionResource.id
  );
  const [llmParameters, setLlmParameters] = useState<LLMRequestBodySchemaType>(
    {}
  );
  const [promptTemplate, setPromptTemplate] = useState<string>("");
  const [messagesTemplate, setMessagesTemplate] = useState<ChatMessage[]>([
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
  ]);

  const [enabledParameters, setEnabledParameters] = useState<
    (keyof LLMRequestBodySchemaType)[]
  >([]);
  const [promptParameters, setPromptParameters] = useState({});
  const [output, setOutput] = useState<string>("");
  const { mutateAsync: createCompletion, isPending } = useCreateCompletion();
  const selectedParameters = enabledParameters.reduce((acc, key) => {
    acc[key] = llmParameters[key];
    return acc;
  }, {} as Record<string, any>);
  const selectedResource = resources.find((r) => r.id === resourceId);
  const completionType = selectedResource?.completionType;

  const parsedParameters = useMemo(() => {
    let params = enabledParameters.reduce((acc, key) => {
      acc[key] = llmParameters[key];
      return acc;
    }, {} as Record<string, any>);
    try {
      const compiledOutput = compile({
        parser: "mustache",
        parameters: promptParameters,
        messagesTemplate:
          completionType === "chat" ? messagesTemplate : undefined,
        promptTemplate:
          completionType === "completion" ? promptTemplate : undefined,
      });
      params = {
        ...params,
        ...compiledOutput,
      };
    } catch (e) {
      if (e instanceof Error) {
        return {
          value: null,
          error: e.message,
        };
      }
      throw e;
    }
    return {
      value: params,
      error: null,
    };
  }, [
    enabledParameters,
    llmParameters,
    promptParameters,
    messagesTemplate,
    promptTemplate,
    completionType,
  ]);

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

  const handleSetPromptTemplate = (template: string) => {
    setPromptTemplate(template);
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

  const handleSetMessagesTemplate = (messages: ChatMessage[]) => {
    setMessagesTemplate(messages);
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

  const handleSetPromptParameters = (parameters: LLMRequestBodySchemaType) => {
    setLlmParameters(parameters);
  };

  const handleCreateCompletion = async () => {
    if (parsedParameters.error !== null) {
      toast({
        title: "Error",
        description: `Invalid Compiled Input: ${parsedParameters.error}`,
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await createCompletion({
        resourceId,
        params: parsedParameters.value,
      });
      setOutput(JSON.stringify(response, null, 2));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <TopNavigation />
      <div className={cn("grid grid-cols-1 gap-4", "p-4", "md:grid-cols-2")}>
        <div className="flex flex-col space-y-2">
          <Select
            value={resourceId}
            onValueChange={(value) => {
              setResourceId(value);
            }}
          >
            <SelectTrigger className="w-64">
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
          <Card>
            <CardHeader className="w-auto block">
              {completionType === "completion" && (
                <Label>Prompt Template</Label>
              )}
              {completionType === "chat" && <Label>Messages Template</Label>}
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
                    resourceId={resourceId}
                    parameters={llmParameters}
                    setParameters={handleSetPromptParameters}
                    enabledParameters={enabledParameters}
                    setEnabledParameters={setEnabledParameters}
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
        <div className="flex flex-col space-y-4">
          <Card>
            <CardHeader>
              <Label>Prompt Parameters</Label>
            </CardHeader>
            <CardContent>
              <CodeMirrorWithError
                className="w-full"
                onChange={(value) => {
                  setPromptParameters(JSON.parse(value));
                }}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                value={
                  JSON.stringify(promptParameters, null, 2) ||
                  JSON.stringify({})
                }
                extensions={[json()]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Label>Compiled Input</Label>
            </CardHeader>
            <CardContent className="space-y-2"> 
              <Textarea
                rows={10}
                value={JSON.stringify(parsedParameters.value ?? {}, null, 2)}
                readOnly={true}
                className={cn("w-full", "bg-gray-100", "dark:bg-gray-900")}
              />
              {parsedParameters.error !== null && (
                <p className="text-red-500 dark:text-red-400 text-xs">
                  {parsedParameters.error}
                </p>
              )}
            </CardContent>
          </Card>
          <Button onClick={handleCreateCompletion} className="w-full">
            {isPending && <Loader2 className="animate-spin" />}
            {!isPending && <p>Run</p>}
          </Button>
          <Card>
            <CardHeader>
              <Label>Output</Label>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={25}
                value={output || "no output"}
                readOnly={true}
                className={cn(
                  "w-full",
                  "bg-gray-100",
                  "dark:bg-gray-900",
                  output === "" && [
                    "text-gray-500",
                    "dark:text-gray-400",
                    "italic",
                  ]
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
