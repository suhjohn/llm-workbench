import { z } from "zod";

export const NUMERIC_REGEX = /^[0-9]+$/;
export const ALPHANUMERIC_UNDERSCORE_DASH_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

// Maybe revisit if we can make this stricter to exactly
// limit it to zod's parse function
const ZodParseFunction = z.function(z.tuple([z.any()])).returns(z.unknown());

export const SelectParameterSchema = z.object({
  type: z.literal("select"),
  default: z.string().nullish(),
  choices: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
  parse: ZodParseFunction,
});

export const SliderParameterSchema = z.object({
  type: z.literal("slider"),
  min: z.number(),
  max: z.number(),
  default: z.number(),
  parse: ZodParseFunction,
});

export const TextareaParameterSchema = z.object({
  type: z.literal("textarea"),
  default: z.string(),
  parse: ZodParseFunction,
});

export const SwitchParameterSchema = z.object({
  type: z.literal("switch"),
  default: z.boolean(),
  parse: ZodParseFunction,
});

export const InputParameterSchema = z.object({
  type: z.literal("input"),
  default: z.string().or(z.number()),
  inputType: z.enum(["string", "number"]),
  parse: ZodParseFunction,
});

export const JSONParameterSchema = z.object({
  type: z.literal("json"),
  default: z.record(z.string(), z.any()).or(z.array(z.any())),
  parse: ZodParseFunction,
});

export const ToolChoiceParameterSchema = z.object({
  type: z.literal("tool_choice"),
  default: z.enum(["none", "auto", "required"]),
  parse: ZodParseFunction,
});

export const ToolParameterSchema = z.object({
  type: z.literal("tools"),
  default: z.array(z.any()),
  parse: ZodParseFunction,
});

export const ParameterInputSchema = z.discriminatedUnion("type", [
  SelectParameterSchema,
  SliderParameterSchema,
  TextareaParameterSchema,
  SwitchParameterSchema,
  InputParameterSchema,
  JSONParameterSchema,
  ToolChoiceParameterSchema,
  ToolParameterSchema,
]);

export type ParameterInputType = z.infer<typeof ParameterInputSchema>;
