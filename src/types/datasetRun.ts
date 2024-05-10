import { z } from "zod";

export const DatasetRunSchema = z.object({
  id: z.string(),
  datasetId: z.string(),
  templateId: z.string(),
  datasetRowId: z.string(),
  output: z.any(), // JSON response
  error: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateDatasetRunRequestBodySchema = z.object({
  id: z.string(),
  datasetId: z.string(),
  templateId: z.string(),
  datasetRowId: z.string(),
  output: z.any(), // JSON response
  error: z.string().nullable(),
});

export type DatasetRunType = z.infer<typeof DatasetRunSchema>;
export type CreateDatasetRunRequestBodyType = z.infer<
  typeof CreateDatasetRunRequestBodySchema
>;
