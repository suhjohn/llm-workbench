"use client";
import { TopNavigation } from "@/components/common/TopNavigation";
import { OpenAIChatCompletionResource } from "@/fixtures/resources";
import { useResources } from "@/hooks/useResources";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";
import { useState } from "react";
import { PromptInput } from "./common/PromptInput";
import { PromptParameters } from "./common/PromptParameters";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { LLMRequestBodySchema } from "@/types/resource";
import { z } from "zod";

export default function HomePage() {
  const { data: resources } = useResources();
  const [chatPrompt, setChatPrompt] = useState<ChatMessage[]>([
    { role: "system", content: "Hello" },
  ]);
  const [completionPrompt, setCompletionPrompt] = useState<string>("");
  const [resourceId, setResourceId] = useState<string>(
    OpenAIChatCompletionResource.id
  );
  const [parameters, setParameters] = useState<
    z.infer<typeof LLMRequestBodySchema>
  >({});
  const [enabledParameters, setEnabledParameters] = useState<string[]>([]);
  const selectedResource = resources.find((r) => r.id === resourceId);
  const promptType = selectedResource?.completionType;
  return (
    <main>
      <TopNavigation />
      {/** Top */}
      <div className="px-4 py-4">
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
      </div>
      <div className={cn("grid grid-cols-1 gap-4", "px-4", "md:grid-cols-2")}>
        <Card>
          <CardHeader>
            <p className={cn("text-sm", "text-gray-500", "font-semibold")}>
              {promptType === "completion" ? "Prompt" : "Messages"}
            </p>
          </CardHeader>
          <CardContent>
            <PromptInput
              completionPromptProps={
                promptType === "completion"
                  ? {
                      value: completionPrompt,
                      onChange: setCompletionPrompt,
                    }
                  : undefined
              }
              chatPromptProps={
                promptType === "chat"
                  ? {
                      value: chatPrompt,
                      onChange: setChatPrompt,
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className={cn("text-sm", "text-gray-500", "font-semibold")}>
              Parameters
            </p>
          </CardHeader>
          <CardContent>
            <PromptParameters
              resourceId={resourceId}
              parameters={parameters}
              setParameters={setParameters}
              enabledParameters={enabledParameters}
              setEnabledParameters={setEnabledParameters}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
