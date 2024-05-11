import { OpenAIProvider } from "../providers";

export const OpenAIGpt4Turbo = {
  id: "61ea563d-83ee-45e9-8ee5-25db449fd0ca",
  name: "gpt-4-turbo",
  readableName: "GPT-4 Turbo",
  description: `New GPT-4 Turbo with Vision
    The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling. Currently points to gpt-4-turbo-2024-04-09.`,
  contextWindow: 128000,
  inputTokenCost: 10,
  outputTokenCost: 30,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt4Turbo20240409 = {
  id: "a14aa3dc-ddc4-441a-a572-536c9609ecfd",
  name: "gpt-4-turbo-2024-04-09",
  readableName: "GPT-4 Turbo 2024-04-09",
  description: `GPT-4 Turbo with Vision model. Vision requests can now use JSON mode and function calling. gpt-4-turbo currently points to this version.`,
  contextWindow: 128000,
  inputTokenCost: 10,
  outputTokenCost: 30,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt4TurboPreview = {
  id: "3d531dbf-c21a-40c7-9200-e040f167376f",
  name: "gpt-4-turbo-preview",
  readableName: "GPT-4 Turbo Preview",
  description: `GPT-4 Turbo preview model. Currently points to gpt-4-0125-preview.`,
  contextWindow: 128000,
  inputTokenCost: 10,
  outputTokenCost: 30,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt40125Preview = {
  id: "3d531dbf-c21a-40c7-9200-e040f167376d",
  name: "gpt-4-0125-preview",
  readableName: "GPT-4 0125 Preview",
  description: `GPT-4 Turbo preview model intended to reduce cases of “laziness” where the model doesn’t complete a task. Returns a maximum of 4,096 output tokens.`,
  contextWindow: 128000,
  inputTokenCost: 0.0000000005,
  outputTokenCost: 0.0000000005,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt41106Preview = {
  id: "3d531dbf-c21a-40c7-9200-e040f167376a",
  name: "gpt-4-1106-preview",
  readableName: "GPT-4 1106 Preview",
  description: `GPT-4 Turbo preview model featuring improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Returns a maximum of 4,096 output tokens. This is a preview model.`,
  contextWindow: 128000,
  inputTokenCost: 30,
  outputTokenCost: 60,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt4VisionPreview = {
  id: "3d531dbf-c21a-40c7-9200-e040f1673761",
  name: "gpt-4-vision-preview",
  readableName: "GPT-4 Vision Preview",
  description: `GPT-4 model with the ability to understand images, in addition to all other GPT-4 Turbo capabilities. This is a preview model, we recommend developers to now use gpt-4-turbo which includes vision capabilities. Currently points to gpt-4-1106-vision-preview.`,
  contextWindow: 128000,
  inputTokenCost: 10,
  outputTokenCost: 30,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt41106VisionPreview = {
  id: "3d531dbf-b21a-40c7-9200-e040f1673761",
  name: "gpt-4-1106-vision-preview",
  readableName: "GPT-4 1106 Vision Preview",
  description: `GPT-4 model with the ability to understand images, in addition to all other GPT-4 Turbo capabilities. This is a preview model, we recommend developers to now use gpt-4-turbo which includes vision capabilities. Returns a maximum of 4,096 output tokens.`,
  contextWindow: 128000,
  inputTokenCost: 10,
  outputTokenCost: 30,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt4 = {
  id: "3d531dbf-a21a-40c7-9200-e040f1673761",
  name: "gpt-4",
  readableName: "GPT-4",
  description: `Currently points to gpt-4-0613.`,
  contextWindow: 8192,
  inputTokenCost: 30,
  outputTokenCost: 60,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt40613 = {
  id: "3d531dbf-f21a-40c7-9200-e040f1673761",
  name: "gpt-4-0613",
  readableName: "GPT-4 0613",
  description: `Snapshot of gpt-4 from June 13th 2023 with improved function calling support.`,
  contextWindow: 8192,
  inputTokenCost: 30,
  outputTokenCost: 60,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt432k = {
  id: "31531dbf-f21a-40c7-9200-e040f1673761",
  name: "gpt-4-32k",
  readableName: "GPT-4 32k",
  description: `Currently points to gpt-4-32k-0613. See continuous model upgrades. This model was never rolled out widely in favor of GPT-4 Turbo.`,
  contextWindow: 32768,
  inputTokenCost: 60,
  outputTokenCost: 120,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt432k0613 = {
  id: "32531dbf-f21a-40c7-9200-e040f1673761",
  name: "gpt-4-32k-0613",
  readableName: "GPT-4 32k 0613",
  description: `Snapshot of gpt-4-32k from June 13th 2023 with improved function calling support. This model was never rolled out widely in favor of GPT-4 Turbo.`,
  contextWindow: 32768,
  inputTokenCost: 60,
  outputTokenCost: 120,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt3_5_Turbo0125 = {
  id: "97790a06-b12d-4695-91ee-30dd805fb51d",
  name: "gpt-3.5-turbo-0125",
  readableName: "GPT-3.5 Turbo 0125",
  description: `The latest GPT-3.5 Turbo model with higher accuracy at responding in requested formats and a fix for a bug which caused a text encoding issue for non-English language function calls. Returns a maximum of 4,096 output tokens.`,
  contextWindow: 16385,
  inputTokenCost: 0.5,
  outputTokenCost: 1.5,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt3_5_Turbo1106 = {
  id: "94ec8189-b264-461b-9ba3-252fa50a2f26",
  name: "gpt-3.5-turbo-1106",
  readableName: "GPT-3.5 Turbo 1106",
  description: `GPT-3.5 Turbo model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more. Returns a maximum of 4,096 output tokens.`,
  contextWindow: 16385,
  inputTokenCost: 0.5,
  outputTokenCost: 1.5,
  providerId: OpenAIProvider.id,
};

export const OpenAIGpt3_5_Turbo = {
  id: "8e41c78b-d219-4c6c-8ad7-db8317e4f804",
  name: "gpt-3.5-turbo",
  readableName: "GPT-3.5 Turbo",
  description: `Currently points to gpt-3.5-turbo-0125.`,
  contextWindow: 16385,
  inputTokenCost: 0.5,
  outputTokenCost: 1.5,
  providerId: OpenAIProvider.id,
};

export const OpenAIModels = [
  OpenAIGpt3_5_Turbo0125,
  OpenAIGpt3_5_Turbo1106,
  OpenAIGpt3_5_Turbo,
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
];
