"use client";
import { TopNavigation } from "@/components/common/TopNavigation";
import { useCreateCompletion } from "@/hooks/useCreateCompletion";
import { useResources } from "@/hooks/useResources";
import { useTemplates, useUpdateTemplate } from "@/hooks/useTemplates";
import { compile } from "@/lib/parser";
import { cn } from "@/lib/utils";
import { DEFAULT_TEMPLATE, PromptTemplateType } from "@/types/prompt";
import { json } from "@codemirror/lang-json";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IndexTemplateSection } from "./IndexTemplateSection";
import { TemplateList } from "./TemplateList";
import { CodeMirrorWithError } from "./common/CodeMirrorWithError";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";

export default function IndexPage() {
  const { data: templates, isLoading, refetch } = useTemplates();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTemplateId = searchParams.get("templateId");
  const { data: resources } = useResources();
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();
  const [template, setTemplate] =
    useState<PromptTemplateType>(DEFAULT_TEMPLATE);
  useEffect(() => {
    if (templates && selectedTemplateId) {
      const selectedTemplate = templates[selectedTemplateId];
      if (selectedTemplate) {
        setTemplate(selectedTemplate);
      }
    }
  }, [templates, selectedTemplateId]);
  const {
    resourceId,
    llmParameters,
    promptTemplate,
    messagesTemplate,
    enabledParameters,
  } = template;
  const { mutateAsync: updateTemplate } = useUpdateTemplate();
  const handleUpdateTemplate = (newTemplate: PromptTemplateType) => {
    setTemplate(newTemplate);
    updateTemplate(newTemplate);
    if (selectedTemplateId !== newTemplate.id)
      router.push(`/?templateId=${newTemplate.id}`);
  };

  // Prompt Parameters
  const [promptParameters, setPromptParameters] = useState({});
  const [output, setOutput] = useState<string>("");

  const { mutateAsync: createCompletion, isPending } = useCreateCompletion();
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
      if (e instanceof Error)
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
    }
  };

  return (
    <div className={"flex relative flex-col space-y-0 h-[100dvh]"}>
      <TopNavigation />
      <div
        className={cn(
          "h-full",
          "flex",
          "gap-4",
          "p-4",
          "overflow-hidden",
          "flex-col",
          "lg:flex-row"
        )}
      >
        <div
          className={cn(
            "w-full",
            "h-auto",
            "flex",
            "space-x-2",
            "overflow-hidden"
          )}
        >
          <TemplateList />
          <IndexTemplateSection
            template={template}
            setTemplate={handleUpdateTemplate}
            promptParameters={promptParameters}
            setPromptParameters={setPromptParameters}
          />
        </div>
        <div
          className={cn("w-full", "flex flex-col space-y-4", "overflow-auto")}
        >
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
