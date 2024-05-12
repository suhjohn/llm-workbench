"use client";
import { Resources } from "@/fixtures/resources";
import { useCookieConfigContext } from "@/hooks/useCookieContext";
import { useGetVariablesCallback } from "@/hooks/useGetVariables";
import { useProviders } from "@/hooks/useProviders";
import { useResources } from "@/hooks/useResources";
import {
  useDeleteTemplateDataset,
  useTemplateDatasets,
} from "@/hooks/useTemplates";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";
import { PromptTemplateType } from "@/types/prompt";
import { json } from "@codemirror/lang-json";
import { ChevronLeft, Trash2Icon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useMemo } from "react";
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
import { Card, CardContent, CardHeader } from "./ui/card";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type TemplateSection = {
  isLoadingTemplate: boolean;
  template: PromptTemplateType;
  setTemplate: (template: PromptTemplateType) => void;
  onClickBack?: () => void;
};

export const TemplateSection: FC<TemplateSection> = ({
  isLoadingTemplate,
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
  const { resolvedTheme } = useTheme();
  const { data: resources } = useResources();
  const { data: providers } = useProviders();
  const { config, setConfig } = useCookieConfigContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedParameters = enabledParameters.reduce((acc, key) => {
    acc[key] = llmParameters[key];
    return acc;
  }, {} as Record<string, any>);
  const selectedResource = resources.find((r) => r.id === resourceId);
  const completionType = selectedResource?.completionType;
  const getVariablesFromParameters = useGetVariablesCallback();
  const { data: templateDatasets } = useTemplateDatasets(templateObj.id);
  const { mutateAsync: deleteTemplateDataset } = useDeleteTemplateDataset();

  const getResourceLogo = (resourceId: string) => {
    if (providers === undefined) {
      return "";
    }
    const resource = Resources.find((r) => r.id === resourceId);
    if (resource === undefined) {
      return "";
    }
    if (resolvedTheme === "dark") {
      return (
        providers.find((p) => p.id === resource.providerId)?.darkLogo || ""
      );
    }
    return providers.find((p) => p.id === resource.providerId)?.logo || "";
  };

  const promptParameters = useMemo(() => {
    try {
      return getVariablesFromParameters({
        promptTemplate,
        messagesTemplate,
        parser: "mustache",
      });
    } catch (e) {
      return [];
    }
  }, [getVariablesFromParameters, promptTemplate, messagesTemplate]);

  const promptParametersError = useMemo(() => {
    try {
      getVariablesFromParameters({
        promptTemplate,
        messagesTemplate,
        parser: "mustache",
      });
      return undefined;
    } catch (e) {
      if (e instanceof Error) {
        return e.message;
      }
      return "Error while setting prompt arguments";
    }
  }, [getVariablesFromParameters, promptTemplate, messagesTemplate]);

  const handleSetPromptTemplate = (newPromptTemplate: string) => {
    setTemplate({
      ...templateObj,
      promptTemplate: newPromptTemplate,
    });
  };

  const handleSetMessagesTemplate = (newMessagesTemplate: ChatMessage[]) => {
    setTemplate({
      ...templateObj,
      messagesTemplate: newMessagesTemplate,
    });
  };

  const handleClickDataset = (id: string) => {
    const newSearchParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "datasetId") {
        newSearchParams.set(key, value);
      }
    });
    newSearchParams.set("datasetId", id);
    newSearchParams.set("datasetView", "detail");
    router.push(`/?${newSearchParams.toString()}`);
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
      </div>
      <Card>
        <CardHeader>
          <Label>Metadata</Label>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label>Id</Label>
            {isLoadingTemplate ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <p className={cn("text-xs")}>{templateObj.id}</p>
            )}
          </div>
          <div>
            <Label>Created</Label>
            {isLoadingTemplate ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <p className={cn("text-xs")}>
                {new Date(templateObj.createdAt).toLocaleString()}
              </p>
            )}
          </div>
          <div>
            <Label>Updated</Label>
            {isLoadingTemplate ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <p className={cn("text-xs")}>
                {new Date(templateObj.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <div>
        <Select
          value={resourceId}
          onValueChange={(value) => {
            setTemplate({
              ...templateObj,
              resourceId: value,
            });
          }}
        >
          <SelectTrigger className="w-full flex-shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Resources.map((resource) => (
              <SelectItem key={resource.id} value={resource.id}>
                <div className="flex space-x-2">
                  <div className="relative w-[16px] h-[16px]">
                    <Image
                      src={getResourceLogo(resource.id)}
                      alt={resource.name}
                      fill
                      objectFit="contain"
                    />
                  </div>
                  <p>{resource.name}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Accordion
        type="multiple"
        defaultValue={
          config.indexTemplateOpenAccordion || [
            "prompt",
            "parameters",
            "datasets",
          ]
        }
        className="w-full space-y-2"
        onValueChange={(value) => {
          setConfig("indexTemplateOpenAccordion", value);
        }}
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
                  Use mustache syntax to define prompt arguments. e.g.
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
                <div className="flex gap-1 items-center flex-wrap">
                  {promptParametersError && (
                    <p className="text-red-500 text-sm">
                      {promptParametersError}
                    </p>
                  )}
                  {promptParametersError === undefined && (
                    <>
                      <span className="text-muted-foreground text-sm">
                        Prompt arguments:
                      </span>
                      {promptParameters.length === 0 && (
                        <span className="italic text-muted-foreground text-sm">
                          No arguments found.
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
                  value={JSON.stringify(selectedParameters, null, 2)}
                  extensions={[json()]}
                />
              </TabsContent>
            </Tabs>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="datasets">
          <AccordionTrigger>
            <Label>Connected Datasets</Label>
          </AccordionTrigger>
          <AccordionContent>
            <div className="w-full flex flex-col space-y-4">
              <p className="text-muted-foreground text-sm">
                Connect datasets that are compatible with this template.
              </p>
              <div
                className={cn(
                  "w-full",
                  "flex",
                  "flex-col",
                  "border",
                  "border-gray-200",
                  "dark:border-gray-800",
                  "rounded-md",
                  "divide-y divide-background-foreground"
                )}
              >
                {templateDatasets?.map((templateDataset) => (
                  <div
                    key={templateDataset.id}
                    className={cn(
                      "justify-between w-full px-3 h-10 flex items-center gap-2"
                    )}
                  >
                    <Button
                      variant={"link"}
                      className="p-0"
                      onClick={() => {
                        handleClickDataset(templateDataset.datasetId);
                      }}
                    >
                      <p>{templateDataset.dataset.name}</p>
                    </Button>
                    <Button
                      className="flex-shirnk-0"
                      onClick={() => {
                        deleteTemplateDataset({
                          templateId: templateObj.id,
                          datasetId: templateDataset.datasetId,
                        });
                      }}
                      variant="ghost"
                    >
                      <Trash2Icon size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
