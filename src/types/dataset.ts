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

export const OutputFieldSchema = z.object({
  name: z.string(),
  path: z.string(),
});

export type OutputFieldType = z.infer<typeof OutputFieldSchema>;

export const DatasetDataRowSchema = z.object({
  id: z.string(),
  arguments: z.record(z.string(), z.string().nullish()),
});

export const DatasetDataSchema = z.object({
  id: z.string(),
  datasetId: z.string(),
  parameterFields: z.array(z.string()),
  outputFields: z.array(OutputFieldSchema),
  data: z.array(DatasetDataRowSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DatasetDataType = z.infer<typeof DatasetDataSchema>;

export const DEFAULT_DATASET: DatasetType = {
  id: uuidv4(),
  name: "New dataset",
  description: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
