import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const DatasetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DatasetType = z.infer<typeof DatasetSchema>;

export const DatasetItemSchema = z.object({
  id: z.string(),
  datasetId: z.string(),
  promptParameters: z.record(z.string(), z.string()),
  error: z.string().nullable(),
  output: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DatasetItemType = z.infer<typeof DatasetItemSchema>;

export const createDefaultDatasetItem = (
  datasetId: string
): DatasetItemType => ({
  id: uuidv4(),
  datasetId,
  promptParameters: {},
  error: "",
  output: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
