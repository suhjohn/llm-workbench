import { OpenAIChatCompletionPromptParametersSchema } from "./openai";

export type ResourceParameterKeyType =
  keyof typeof OpenAIChatCompletionPromptParametersSchema;

export const ResourceParameterKeys: ResourceParameterKeyType[] = Object.keys(
  OpenAIChatCompletionPromptParametersSchema
) as ResourceParameterKeyType[];
