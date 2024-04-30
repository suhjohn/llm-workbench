import {
  AnthropicProvider,
  OpenAIProvider,
  OpenRouterProvider,
  TogetherProvider,
} from "./providers";

export enum CompletionType {
  Chat = "chat",
  Completion = "completion",
}

export const OpenAIChatCompletionResource = {
  id: "4e53cede-1ca8-479a-a32e-6e8eaf6dd848",
  name: "OpenAI Chat Completion API",
  completionType: CompletionType.Chat,
  providerId: OpenAIProvider.id,
  path: "https://api.openai.com/v1/chat/completions",
};

export const AnthropicChatCompletionResource = {
  id: "6cab4a8f-3061-40c8-bbaf-bc373abdc705",
  name: "Anthropic Messages API",
  completionType: CompletionType.Chat,
  providerId: AnthropicProvider.id,
  path: "https://api.anthropic.com/v1/messages",
};

export const TogetherChatCompletionResource = {
  id: "f2f2b4f2-c939-482a-b153-da774098c0a1",
  name: "Together Chat Completions API",
  completionType: CompletionType.Chat,
  providerId: TogetherProvider.id,
  path: "https://api.together.xyz/v1/chat/completions",
};

export const TogetherCompletionResource = {
  id: "ffd61252-ea4a-43c4-a85d-98e84e8b9952",
  name: "Together Completions API",
  completionType: CompletionType.Completion,
  providerId: TogetherProvider.id,
  path: "https://api.together.xyz/v1/completions",
};

export const OpenRouterChatCompletionResource = {
  id: "92cdaafe-fcad-4f80-8d7c-9ff03bb86cbf",
  name: "OpenRouter Chat Completions API",
  completionType: CompletionType.Chat,
  providerId: OpenRouterProvider.id,
  path: "https://openrouter.ai/api/v1/chat/completions",
};

export const Resources = [
  OpenAIChatCompletionResource,
  AnthropicChatCompletionResource,
  TogetherChatCompletionResource,
  TogetherCompletionResource,
  OpenRouterChatCompletionResource,
];
