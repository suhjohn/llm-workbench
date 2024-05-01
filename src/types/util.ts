import { z } from "zod";

// Utility function to extract keys from a union schema
export function getKeysFromUnionSchema(
  schema: z.ZodUnion<[z.ZodTypeAny, ...z.ZodTypeAny[]]>
) {
  return schema.options.flatMap((option) =>
    option instanceof z.ZodObject ? Object.keys(option.shape) : []
  );
}
