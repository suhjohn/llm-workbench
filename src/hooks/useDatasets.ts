import { localForageStore } from "@/lib/localforage";
import {
  DatasetItemSchema,
  DatasetItemType,
  DatasetSchema,
  DatasetType,
  createDefaultDatasetItem,
} from "@/types/dataset";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const DATASETS_QUERY_KEY = "datasets";

export const DATASETS_LOCAL_STORAGE_KEY = "datasets";

export const DATASET_ITEMS_QUERY_KEY = "datasetItems";

export const getDatasetItemStorageKey = (datasetId: string) =>
  `datasetItems-${datasetId}`;

/** hooks */
export const useDatasets = () => {
  return useQuery({
    queryKey: [DATASETS_QUERY_KEY],
    queryFn: async () => {
      const datasets = await localForageStore.getItem<{
        [x: string]: unknown;
      }>(DATASETS_LOCAL_STORAGE_KEY);
      if (!datasets) {
        return {};
      }
      return Object.fromEntries(
        Object.entries(datasets).map(([id, dataset]) => [
          id,
          DatasetSchema.parse(dataset),
        ]) ?? []
      );
    },
  });
};

export const useCreateDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dataset: DatasetType) => {
      const datasets =
        (await localForageStore.getItem<{
          [x: string]: unknown;
        }>(DATASETS_LOCAL_STORAGE_KEY)) ?? {};
      await localForageStore.setItem(DATASETS_LOCAL_STORAGE_KEY, {
        ...datasets,
        [dataset.id]: dataset,
      });
      queryClient.setQueryData([DATASETS_QUERY_KEY], {
        ...datasets,
        [dataset.id]: dataset,
      });
    },
  });
};

export const useUpdateDataset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dataset: { id: string; name: string }) => {
      const datasets =
        (await localForageStore.getItem<{
          [x: string]: unknown;
        }>(DATASETS_LOCAL_STORAGE_KEY)) ?? {};
      await localForageStore.setItem(DATASETS_LOCAL_STORAGE_KEY, {
        ...datasets,
        [dataset.id]: dataset,
      });
      queryClient.setQueryData([DATASETS_QUERY_KEY], {
        ...datasets,
        [dataset.id]: dataset,
      });
    },
  });
};

export const useDeleteDataset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (datasetId: string) => {
      const datasets =
        (await localForageStore.getItem<{
          [x: string]: unknown;
        }>(DATASETS_LOCAL_STORAGE_KEY)) ?? {};
      delete datasets[datasetId];
      await localForageStore.setItem(DATASETS_LOCAL_STORAGE_KEY, datasets);
      queryClient.setQueryData([DATASETS_QUERY_KEY], datasets);
    },
  });
};

export const useDatasetItems = (datasetId: string | null) => {
  return useQuery({
    queryKey: [DATASET_ITEMS_QUERY_KEY, { datasetId }],
    queryFn: async () => {
      if (!datasetId) {
        return [];
      }
      const datasetItems = await localForageStore.getItem<{
        [x: string]: unknown;
      }>(`${getDatasetItemStorageKey(datasetId)}`);
      if (!datasetItems) {
        return [];
      }
      return Object.values(
        Object.fromEntries(
          Object.entries(datasetItems).map(([id, datasetItem]) => [
            id,
            DatasetItemSchema.parse(datasetItem),
          ]) ?? []
        )
      );
    },
  });
};

export const useCreateDatasetItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ datasetId }: { datasetId: string }) => {
      const datasetItems =
        (await localForageStore.getItem<{
          [x: string]: unknown;
        }>(`${getDatasetItemStorageKey(datasetId)}`)) ?? {};
      const newDatasetItem = createDefaultDatasetItem(datasetId);
      await localForageStore.setItem(`${getDatasetItemStorageKey(datasetId)}`, {
        ...datasetItems,
        [newDatasetItem.id]: newDatasetItem,
      });
      const asArray = Object.values(datasetItems);
      queryClient.setQueryData(
        [DATASET_ITEMS_QUERY_KEY, { datasetId }],
        [...asArray, newDatasetItem]
      );
    },
  });
};

export const useUpdateDatasetItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ datasetItem }: { datasetItem: DatasetItemType }) => {
      const datasetItems =
        (await localForageStore.getItem<{
          [x: string]: unknown;
        }>(`${getDatasetItemStorageKey(datasetItem.datasetId)}`)) ?? {};
      await localForageStore.setItem(
        `${getDatasetItemStorageKey(datasetItem.datasetId)}`,
        {
          ...datasetItems,
          [datasetItem.id]: datasetItem,
        }
      );
    },
  });
};

export const useBulkUpdateDatasetItems = () => {
  return useMutation({
    mutationFn: async (datasetItems: DatasetItemType[]) => {
      datasetItems.forEach(async (datasetItem) => {
        const datasetItems =
          (await localForageStore.getItem<{
            [x: string]: unknown;
          }>(`${getDatasetItemStorageKey(datasetItem.datasetId)}`)) ?? {};
        await localForageStore.setItem(
          `${getDatasetItemStorageKey(datasetItem.datasetId)}`,
          {
            ...datasetItems,
            [datasetItem.id]: datasetItem,
          }
        );
      });
    },
  });
};

export const useDeleteDatasetItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      datasetId,
      datasetItemId,
    }: {
      datasetId: string;
      datasetItemId: string;
    }) => {
      const datasetItems =
        (await localForageStore.getItem<{
          [x: string]: unknown;
        }>(`${getDatasetItemStorageKey(datasetId)}`)) ?? {};
      delete datasetItems[datasetItemId];
      await localForageStore.setItem(
        `${getDatasetItemStorageKey(datasetId)}`,
        datasetItems
      );
      const asArray = Object.values(datasetItems);
      queryClient.setQueryData(
        [DATASET_ITEMS_QUERY_KEY, { datasetId }],
        asArray
      );
    },
  });
};
