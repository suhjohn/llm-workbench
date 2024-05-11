import { OpenAIModels } from "@/fixtures/models/openai";
import { z } from "zod";
import {
  ALPHANUMERIC_UNDERSCORE_DASH_REGEX,
  NUMERIC_REGEX,
  ParameterInputType,
} from "./common";

export const OpenAIChatCompletionToolChoiceObjectSchema = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string(),
  }),
});

export type OpenAIChatCompletionParameterType =
  | "model"
  | "frequency_penalty"
  | "logit_bias"
  | "logprobs"
  | "top_logprobs"
  | "max_tokens"
  | "presence_penalty"
  | "response_format"
  | "seed"
  | "stop"
  | "temperature"
  | "top_p"
  | "tools"
  | "tool_choice"
  | "user";

export const OpenAIChatCompletionPromptParametersSchema: Record<
  OpenAIChatCompletionParameterType,
  ParameterInputType
> = {
  model: {
    type: "select",
    choices: OpenAIModels,
    parse: z.string().nullish().parse,
  },
  frequency_penalty: {
    type: "slider",
    min: -2,
    max: 2,
    default: 0,
    parse: z.coerce.number().min(-2).max(2).nullish().parse,
  },
  logit_bias: {
    type: "json",
    default: {},
    parse: z
      .record(
        z.string().regex(NUMERIC_REGEX, {
          message: `Key of logit_bias must be a string of numbers. e.g. {"1234":1}`,
        }),
        z.coerce.number().min(-100).max(100)
      )
      .nullish().parse,
  },
  logprobs: {
    type: "switch",
    default: false,
    parse: z.boolean().nullish().parse,
  },
  top_logprobs: {
    type: "slider",
    min: 0,
    max: 20,
    default: 0,
    parse: z.number().nullish().parse,
  },
  max_tokens: {
    type: "input",
    default: 512,
    inputType: "number",
    parse: z.number().nullish().parse,
  },
  presence_penalty: {
    type: "slider",
    min: -2,
    max: 2,
    default: 0,
    parse: z.coerce.number().min(-2).max(2).nullish().parse,
  },
  response_format: {
    type: "json",
    default: { type: "json_object" },
    parse: z.object({ type: z.enum(["json_object", "text"]) }).nullish().parse,
  },
  seed: {
    type: "input",
    default: 0,
    inputType: "number",
    parse: z.coerce.number().nullish().parse,
  },
  stop: {
    type: "json",
    default: [],
    parse: z.array(z.string()).max(4).nullish().parse,
  },
  temperature: {
    type: "slider",
    min: 0,
    max: 2,
    default: 0,
    parse: z.coerce.number().min(0).max(2).nullish().parse,
  },
  top_p: {
    type: "slider",
    min: 0,
    max: 1,
    default: 0,
    parse: z.coerce.number().min(0).max(1).nullish().parse,
  },
  tools: {
    type: "tools",
    default: [],
    parse: z
      .array(
        z.object({
          type: z.literal("function"),
          function: z.object({
            description: z.string().nullish(),
            name: z.string().regex(ALPHANUMERIC_UNDERSCORE_DASH_REGEX, {
              message: "Name must be alphanumeric, underscore, or dash.",
            }),
            parameters: z.record(z.string(), z.any()).nullish(),
          }),
        })
      )
      .nullish().parse,
  },
  tool_choice: {
    type: "tool_choice",
    default: "auto",
    parse: z
      .enum(["none", "auto", "required"])
      .or(OpenAIChatCompletionToolChoiceObjectSchema)
      .nullish().parse,
  },
  user: {
    type: "input",
    default: "",
    inputType: "string",
    parse: z.string().nullish().parse,
  },
};
