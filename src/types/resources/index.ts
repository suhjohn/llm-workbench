import {
  OpenAIChatCompletionResource,
  TogetherChatCompletionResource,
} from "@/fixtures/resources";
import { OpenAIChatCompletionPromptParametersSchema } from "./openai";
import { TogetherChatCompletionPromptParametersSchema } from "./together";

export type ResourceParameterKeyType =
  keyof typeof OpenAIChatCompletionPromptParametersSchema &
    keyof typeof TogetherChatCompletionPromptParametersSchema;

export const ResourceParameterKeys: ResourceParameterKeyType[] = Object.keys(
  OpenAIChatCompletionPromptParametersSchema
).concat(
  Object.keys(TogetherChatCompletionPromptParametersSchema)
) as ResourceParameterKeyType[];

export const ResourceParameterSchemaMap = {
  [OpenAIChatCompletionResource.id]: OpenAIChatCompletionPromptParametersSchema,
  [TogetherChatCompletionResource.id]:
    TogetherChatCompletionPromptParametersSchema,
};
