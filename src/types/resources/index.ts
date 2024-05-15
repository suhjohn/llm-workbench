import {
  OpenAIChatCompletionResource,
  TogetherChatCompletionResource,
} from "@/fixtures/resources";
import { OpenAIChatCompletionRequestSchema } from "./openai";
import { TogetherChatCompletionRequestSchema } from "./together";

export type ResourceParameterKeyType =
  keyof typeof OpenAIChatCompletionRequestSchema &
    keyof typeof TogetherChatCompletionRequestSchema;

export const ResourceParameterKeys: ResourceParameterKeyType[] = Object.keys(
  OpenAIChatCompletionRequestSchema
).concat(
  Object.keys(TogetherChatCompletionRequestSchema)
) as ResourceParameterKeyType[];

export const ResourceParameterSchemaMap = {
  [OpenAIChatCompletionResource.id]: OpenAIChatCompletionRequestSchema,
  [TogetherChatCompletionResource.id]:
    TogetherChatCompletionRequestSchema,
};
