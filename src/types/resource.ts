import { z } from "zod";

const numeric = /^[0-9]+$/;
const alphanumericalUnderscoreDash = /^[a-zA-Z0-9_-]{1,64}$/;

export const OpenAIChatCompletionToolChoiceEnumSchema = z.enum([
  "none",
  "auto",
  "required",
]);

export const OpenAIChatCompletionToolChoiceObjectSchema = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string(),
  }),
});

export const OpenAIChatCompletionRequestBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "system"]),
      content: z.string(),
    })
  ).nullish(),
  model: z.string().nullish(),
  frequency_penalty: z.coerce.number().min(-2).max(2).nullish(),
  logit_bias: z
    .record(
      z.string().regex(numeric, {
        message: `Key of logit_bias must be a string of numbers. e.g. {"1234":1}`,
      }),
      z.coerce.number().min(-100).max(100)
    )
    .nullish(),
  logprobs: z.boolean().nullish(),
  top_logprobs: z.coerce.number().min(0).max(20).nullish(),
  max_tokens: z.coerce.number().nullish(),
  presence_penalty: z.coerce.number().min(-2).max(2).nullish(),
  response_format: z
    .object({
      type: z.enum(["json_object", "text"]).nullish(),
    })
    .nullish(),
  seed: z.coerce.number().nullish(),
  stop: z.array(z.string()).max(4).nullish(),
  temperature: z.coerce.number().min(0).max(2).nullish(),
  top_p: z.coerce.number().min(0).max(1).nullish(),
  tools: z
    .array(
      z.object({
        type: z.literal("function"),
        function: z.object({
          description: z.string().nullish(),
          name: z.string().regex(alphanumericalUnderscoreDash, {
            message: "Name must be alphanumeric, underscore, or dash.",
          }),
          parameters: z.record(z.string(), z.any()).nullish(),
        }),
      })
    )
    .nullish(),
  tool_choice: OpenAIChatCompletionToolChoiceEnumSchema.or(
    OpenAIChatCompletionToolChoiceObjectSchema
  ).nullish(),
  user: z.string().nullish(),
});

export const SliderRenderSchema = z.object({
  type: z.literal("slider"),
  min: z.number(),
  max: z.number(),
  default: z.number(),
});

export const TextareaRenderSchema = z.object({
  type: z.literal("textarea"),
  default: z.string(),
});

export const SwitchRenderSchema = z.object({
  type: z.literal("switch"),
  default: z.boolean(),
});

export const InputRenderSchema = z.object({
  type: z.literal("input"),
  default: z.string().or(z.number()),
  inputType: z.enum(["string", "number"]),
});

export const JSONRenderSchema = z.object({
  type: z.literal("json"),
  default: z.record(z.string(), z.any()).or(z.array(z.any())),
});

export const ToolChoiceRenderSchema = z.object({
  type: z.literal("tool_choice"),
  default: z.enum(["none", "auto", "required"]),
});

export const ToolRenderSchema = z.object({
  type: z.literal("tools"),
  default: z.array(z.any()),
});

export const MessagesRenderSchema = z.object({
  type: z.literal("messages"),
  default: z.array(
    z.object({
      role: z.enum(["user", "system"]),
      content: z.string(),
    })
  ),
});

export const ModelRenderSchema = z.object({
  type: z.literal("model"),
  default: z.string(),
});

export const RenderSchema = z.discriminatedUnion("type", [
  SliderRenderSchema,
  TextareaRenderSchema,
  SwitchRenderSchema,
  InputRenderSchema,
  JSONRenderSchema,
  ToolChoiceRenderSchema,
  ToolRenderSchema,
  MessagesRenderSchema,
  ModelRenderSchema,
]);

export const OpenAIChatCompletionRenderSchema: Record<
  keyof z.infer<typeof OpenAIChatCompletionRequestBodySchema>,
  z.infer<typeof RenderSchema>
> = {
  messages: {
    type: "messages",
    default: [],
  },
  model: {
    type: "model",
    default: "",
  },
  frequency_penalty: {
    type: "slider",
    min: -2,
    max: 2,
    default: 0,
  },
  logit_bias: {
    type: "json",
    default: {},
  },
  logprobs: {
    type: "switch",
    default: false,
  },
  top_logprobs: {
    type: "slider",
    min: 0,
    max: 20,
    default: 0,
  },
  max_tokens: {
    type: "input",
    default: 200,
    inputType: "number",
  },
  presence_penalty: {
    type: "slider",
    min: -2,
    max: 2,
    default: 0,
  },
  response_format: {
    type: "json",
    default: { type: "json_object" },
  },
  seed: {
    type: "input",
    default: 0,
    inputType: "number",
  },
  stop: {
    type: "json",
    default: [],
  },
  temperature: {
    type: "slider",
    min: 0,
    max: 2,
    default: 0,
  },
  top_p: {
    type: "slider",
    min: 0,
    max: 1,
    default: 0,
  },
  tools: {
    type: "tools",
    default: [],
  },
  tool_choice: {
    type: "tool_choice",
    default: "auto",
  },
  user: {
    type: "input",
    default: "",
    inputType: "string",
  },
};

export const OpenRouterChatCompletionRequestBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "system", "assistant"]),
      content: z.string(),
    })
  ),
  prompt: z.string().nullish(),
  temperature: z.coerce.number().min(0).max(2).nullish(),
  top_p: z.coerce.number().min(0).max(1).nullish(),
  topK: z.coerce.number().nullish(),
  frequency_penalty: z.coerce.number().min(-2).max(2).nullish(),
  presence_penalty: z.coerce.number().min(-2).max(2).nullish(),
  repetitionPenalty: z.coerce.number().min(0).max(2).nullish(),
  minP: z.coerce.number().min(0).max(1).nullish(),
  topA: z.coerce.number().min(0).max(1).nullish(),
  seed: z.coerce.number().nullish(),
  max_tokens: z.coerce.number().min(1).nullish(),
  logit_bias: z.record(z.string(), z.coerce.number()).nullish(),
  response_format: z
    .object({
      type: z.enum(["json", "text"]).nullish(),
    })
    .nullish(),
  stop: z.array(z.string()).nullish(),
});

export const TogetherChatCompletionRequestBodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "system", "assistant"]),
      content: z.string(),
    })
  ),
  max_tokens: z.number().nullish(),
  stop: z.array(z.string()).nullish(),
  temperature: z.number().min(0).max(2).nullish(),
  top_p: z.number().min(0).max(1).nullish(),
  topK: z.number().nullish(),
  repetitionPenalty: z.number().min(0).max(2).nullish(),
  logprobs: z.number().min(0).nullish(),
  echo: z.boolean().nullish(),
  response_format: z
    .object({
      type: z.enum(["json_object"]).nullish(),
      schema: z.record(z.string(), z.any()).nullish(),
    })
    .nullish(),
  tools: z
    .array(
      z.object({
        type: z.string(),
        function: z.object({
          description: z.string(),
          name: z.string(),
          parameters: z.record(z.string(), z.any()).nullish(),
        }),
      })
    )
    .nullish(),
  tool_choice: z
    .object({
      type: z.string(),
      function: z.object({
        name: z.string(),
      }),
    })
    .nullish(),
});

export const LLMRequestBodySchema = z.union([
  OpenAIChatCompletionRequestBodySchema,
  OpenRouterChatCompletionRequestBodySchema,
  TogetherChatCompletionRequestBodySchema,
]);
