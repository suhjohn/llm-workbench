"use client";
import { TopNavigation } from "@/components/common/TopNavigation";
import { OpenAIChatCompletionResource } from "@/fixtures/resources";
import { useCreateCompletion } from "@/hooks/useCreateCompletion";
import { useResources } from "@/hooks/useResources";
import { compile, getVariables } from "@/lib/parser";
import { cn } from "@/lib/utils";
import { LLMRequestBodySchema } from "@/types/resource";
import { json } from "@codemirror/lang-json";
import { useTheme } from "next-themes";
import { useState } from "react";
import { z } from "zod";
import { CodeMirrorWithError } from "./common/CodeMirrorWithError";
import { PromptParameters } from "./common/PromptParameters";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: resources } = useResources();
  const { resolvedTheme } = useTheme();
  const [resourceId, setResourceId] = useState<string>(
    OpenAIChatCompletionResource.id
  );
  const [llmParameters, setLlmParameters] = useState<
    z.infer<typeof LLMRequestBodySchema>
  >({});
  const [enabledParameters, setEnabledParameters] = useState<
    (keyof z.infer<typeof LLMRequestBodySchema>)[]
  >([]);
  const [promptParameters, setPromptParameters] = useState({});
  const [parsedParameters, setParsedParameters] = useState({});
  const [output, setOutput] = useState<string>("");
  const { mutateAsync: createCompletion, isPending } = useCreateCompletion();

  const selectedParameters = enabledParameters.reduce((acc, key) => {
    acc[key] = llmParameters[key];
    return acc;
  }, {} as Record<string, any>);
  const selectedResource = resources.find((r) => r.id === resourceId);

  const getVariablesFromParameters = (
    parser: string,
    parameters: z.infer<typeof LLMRequestBodySchema>
  ) => {
    if (parameters.messages !== undefined && parameters.messages !== null) {
      const variables = new Set<string>();
      parameters.messages?.forEach((message) => {
        getVariables(parser, message.content).forEach((variable) => {
          variables.add(variable);
        });
      });
      return Array.from(variables);
    }
    if (parameters.prompt !== undefined && parameters.prompt !== null) {
      return getVariables(parser, parameters.prompt);
    }
    return [];
  };

  const handleSetPromptParameters = (
    parameters: z.infer<typeof LLMRequestBodySchema>
  ) => {
    setLlmParameters(parameters);
    const newVariables = getVariablesFromParameters("mustache", parameters);
    const newPromptParameters = newVariables.reduce((acc, variable) => {
      acc[variable] = "";
      return acc;
    }, {} as Record<string, any>);
    const allNewPromptParameters = {
      ...newPromptParameters,
      ...promptParameters,
    };
    setPromptParameters(allNewPromptParameters);
    let params = {
      ...parameters,
    };
    try {
      const compiledOutput = compile({
        parser: "mustache",
        parameters: allNewPromptParameters,
        messagesTemplate: parameters.messages ?? undefined,
        promptTemplate: parameters.prompt ?? undefined,
      });
      params = {
        ...params,
        ...compiledOutput,
      };
    } catch (e) {}
    setParsedParameters(params);
  };

  const handleCreateCompletion = async () => {
    try {
      const response = await createCompletion({
        resourceId,
        params: parsedParameters,
      });
      console.log(response);
      setOutput(JSON.stringify(response, null, 2));
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <main>
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
            <Tabs defaultValue="ui">
              <CardHeader className="w-auto block">
                <TabsList>
                  <TabsTrigger value="ui">UI</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
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
          <div>
            <div className="h-10 flex items-center">
              <p className="font-semibold">Parameters</p>
            </div>
            <CodeMirrorWithError
              className="w-full"
              onChange={(value) => {
                setPromptParameters(JSON.parse(value));
              }}
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              value={
                JSON.stringify(promptParameters, null, 2) || JSON.stringify({})
              }
              extensions={[json()]}
            />
          </div>
          <Button onClick={handleCreateCompletion} className="w-full">
            {isPending && <Loader2 className="animate-spin" />}
            {!isPending && <p>Run</p>}
          </Button>
          <div>
            <div className="h-10 flex items-center">
              <p className="font-semibold">Input</p>
            </div>
            <Textarea
              rows={15}
              value={JSON.stringify(parsedParameters, null, 2)}
              readOnly={true}
              className="w-full"
              placeholder="Output"
            />
          </div>
          <div>
            <div className="h-10 flex items-center">
              <p className="font-semibold">Output</p>
            </div>
            <Textarea
              rows={25}
              value={output}
              readOnly={true}
              className="w-full"
              placeholder="Output"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
