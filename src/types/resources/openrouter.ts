import { z } from "zod";

export const OpenRouterChatCompletionRequestBodySchema = z.object({
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
