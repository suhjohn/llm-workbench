import { OpenAIChatCompletionResource } from "@/fixtures/resources";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { ChatMessageSchema } from "./chat";
import { DatasetSchema } from "./dataset";
import { LLMRequestBodySchema } from "./resource";
import { getKeysFromUnionSchema } from "./util";

type LLMRequestBodyKeyType = keyof z.infer<typeof LLMRequestBodySchema>;

const keys = getKeysFromUnionSchema(LLMRequestBodySchema);

export const PromptTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  resourceId: z.string(),
  llmParameters: LLMRequestBodySchema,
  promptTemplate: z.string(),
  messagesTemplate: z.array(ChatMessageSchema),
  enabledParameters: z.array(
    z.enum(keys as [LLMRequestBodyKeyType, ...LLMRequestBodyKeyType[]])
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PromptTemplateDatasetSchema = z.object({
  id: z.string(),
  promptTemplateId: z.string(),
  datasetId: z.string(),
  dataset: DatasetSchema,
  template: PromptTemplateSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PromptTemplateType = z.infer<typeof PromptTemplateSchema>;

export type PromptTemplateDatasetType = z.infer<
  typeof PromptTemplateDatasetSchema
>;

export const DEFAULT_TEMPLATE: PromptTemplateType = {
  id: uuidv4(),
  name: "New template",
  resourceId: OpenAIChatCompletionResource.id,
  llmParameters: {},
  promptTemplate: "",
  messagesTemplate: [
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
  ],
  enabledParameters: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
