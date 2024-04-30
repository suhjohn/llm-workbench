import { OpenAIProvider } from "../providers";

export const OpenAIGpt4Turbo = {
  name: "gpt-4-turbo",
  readableName: "GPT-4 Turbo",
  description: `New GPT-4 Turbo with Vision
    The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling. Currently points to gpt-4-turbo-2024-04-09.`,
  contextWindow: 128000,
  inputTokenCost: 0.0000000005,
  outputTokenCost: 0.0000000005,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt4Turbo20240409 = {
  name: "gpt-4-turbo-2024-04-09",
  readableName: "GPT-4 Turbo 2024-04-09",
  description: `GPT-4 Turbo with Vision model. Vision requests can now use JSON mode and function calling. gpt-4-turbo currently points to this version.`,
  contextWindow: 128000,
  inputTokenCost: 0.0000000005,
  outputTokenCost: 0.0000000005,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt4TurboPreview = {
  name: "gpt-4-turbo-preview",
  readableName: "GPT-4 Turbo Preview",
  description: `GPT-4 Turbo preview model. Currently points to gpt-4-0125-preview.`,
  contextWindow: 128000,
  inputTokenCost: 0.0000000005,
  outputTokenCost: 0.0000000005,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt40125Preview = {
  name: "gpt-4-0125-preview",
  readableName: "GPT-4 0125 Preview",
  description: `GPT-4 Turbo preview model intended to reduce cases of “laziness” where the model doesn’t complete a task. Returns a maximum of 4,096 output tokens.`,
  contextWindow: 128000,
  inputTokenCost: 0.0000000005,
  outputTokenCost: 0.0000000005,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt41106Preview = {
  name: "gpt-4-1106-preview",
  readableName: "GPT-4 1106 Preview",
  description: `GPT-4 Turbo preview model featuring improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Returns a maximum of 4,096 output tokens. This is a preview model.`,
  contextWindow: 128000,
  inputTokenCost: 0.0000000005,
  outputTokenCost: 0.0000000005,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt4VisionPreview = {
  name: "gpt-4-vision-preview",
  readableName: "GPT-4 Vision Preview",
  description: `GPT-4 model with the ability to understand images, in addition to all other GPT-4 Turbo capabilities. This is a preview model, we recommend developers to now use gpt-4-turbo which includes vision capabilities. Currently points to gpt-4-1106-vision-preview.`,
  contextWindow: 128000,
  inputTokenCost: 0.0000000005,
  outputTokenCost: 0.0000000005,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt41106VisionPreview = {
  name: "gpt-4-1106-vision-preview",
  readableName: "GPT-4 1106 Vision Preview",
  description: `GPT-4 model with the ability to understand images, in addition to all other GPT-4 Turbo capabilities. This is a preview model, we recommend developers to now use gpt-4-turbo which includes vision capabilities. Returns a maximum of 4,096 output tokens.`,
  contextWindow: 128000,
  inputTokenCost: 0.0000000005,
  outputTokenCost: 0.0000000005,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt4 = {
  name: "gpt-4",
  readableName: "GPT-4",
  description: `Currently points to gpt-4-0613.`,
  contextWindow: 8192,
  inputTokenCost: 0.0000000005,
  outputTokenCost: 0.0000000005,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt40613 = {
  name: "gpt-4-0613",
  readableName: "GPT-4 0613",
  description: `Snapshot of gpt-4 from June 13th 2023 with improved function calling support.`,
  contextWindow: 8192,
  inputTokenCost: 0.0000000005,
  outputTokenCost: 0.0000000005,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt432k = {
  name: "gpt-4-32k",
  readableName: "GPT-4 32k",
  description: `Currently points to gpt-4-32k-0613. See continuous model upgrades. This model was never rolled out widely in favor of GPT-4 Turbo.`,
  contextWindow: 32768,
  inputTokenCost: 0.0000000005,
  outputTokenCost: 0.0000000005,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt432k0613 = {
  name: "gpt-4-32k-0613",
  readableName: "GPT-4 32k 0613",
  description: `Snapshot of gpt-4-32k from June 13th 2023 with improved function calling support. This model was never rolled out widely in favor of GPT-4 Turbo.`,
  contextWindow: 32768,
  inputTokenCost: 0.0000000005,
  outputTokenCost: 0.0000000005,
  providerId: OpenAIProvider.id,
};


export const Models = [
  OpenAIGpt4Turbo,
  OpenAIGpt4Turbo20240409,
  OpenAIGpt4TurboPreview,
  OpenAIGpt40125Preview,
  OpenAIGpt41106Preview,
  OpenAIGpt4VisionPreview,
  OpenAIGpt41106VisionPreview,
  OpenAIGpt4,
  OpenAIGpt40613,
  OpenAIGpt432k,
  OpenAIGpt432k0613,
]