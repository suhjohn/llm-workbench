import { TogetherModels } from "@/fixtures/models/together";
import { z } from "zod";
import {
  ALPHANUMERIC_UNDERSCORE_DASH_REGEX,
  ParameterInputType,
} from "./common";

export type TogetherChatCompletionParameterType =
  | "model"
  | "max_tokens"
  | "stop"
  | "temperature"
  | "top_p"
  | "top_k"
  | "repetition_penalty"
  | "logprobs"
  | "echo"
  | "n"
  | "safety_model"
  | "response_format"
  | "tools"
  | "tool_choice"
  | "frequency_penalty"
  | "presence_penalty"
  | "min_p";

export const TogetherChatCompletionPromptParametersSchema: Record<
  TogetherChatCompletionParameterType,
  ParameterInputType
> = {
  model: {
    type: "select",
    default: "",
    choices: TogetherModels,
    parse: z.string().nullish().parse,
  },
  max_tokens: {
    type: "input",
    default: 512,
    inputType: "number",
    parse: z.number().nullish().parse,
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
  top_k: {
    type: "input",
    default: 50,
    inputType: "number",
    parse: z.number().nullish().parse,
  },
  repetition_penalty: {
    type: "input",
    default: 1,
    inputType: "number",
    parse: z.number().nullish().parse,
  },
  logprobs: {
    type: "input",
    default: 1,
    inputType: "number",
    parse: z.number().nullish().parse,
  },
  echo: {
    type: "switch",
    default: false,
    parse: z.boolean().nullish().parse,
  },
  n: {
    type: "input",
    default: 1,
    inputType: "number",
    parse: z.number().nullish().parse,
  },
  safety_model: {
    type: "select",
    choices: [
      {
        id: "f82afef8-81c6-4f4a-b00b-6fd8eae13201",
        name: "Meta-Llama/Llama-Guard-7b",
      },
    ],
    parse: z.string().nullish().parse,
  },
  response_format: {
    type: "json",
    default: { type: "json_object", schema: {} },
    parse: z
      .object({
        type: z.enum(["json_object", "text"]),
        schema: z.record(z.string(), z.any()).nullish(),
      })
      .nullish().parse,
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
    type: "json",
    default: { type: "function", function: { name: "" } },
    parse: z
      .object({
        type: z.literal("function"),
        function: z.object({
          name: z.string(),
        }),
      })
      .nullish().parse,
  },
  frequency_penalty: {
    type: "slider",
    min: -2,
    max: 2,
    default: 0,
    parse: z.coerce.number().min(-2).max(2).nullish().parse,
  },
  presence_penalty: {
    type: "slider",
    min: -2,
    max: 2,
    default: 0,
    parse: z.coerce.number().min(-2).max(2).nullish().parse,
  },
  min_p: {
    type: "input",
    default: 0,
    inputType: "number",
    parse: z.number().nullish().parse,
  },
};
