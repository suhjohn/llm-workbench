import { z } from "zod";

export const TogetherChatCompletionRequestBodySchema = z.object({
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
