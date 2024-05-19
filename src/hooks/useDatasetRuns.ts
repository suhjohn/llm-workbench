import { localForageStore } from "@/lib/localforage";
import {
  CreateDatasetRunRequestBodyType,
  DatasetRunType,
} from "@/types/datasetRun";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const getDatasetRunsStorageKey = (datasetId: string) =>
  `datasetRuns-${datasetId}`;

/**
 * Retrieves the most recent dataset run per unique datasetRowId.
 * Todo: improve on algorithm in the future
 * @param param0
 * @returns [DatasetRowId, DatasetRun]
 */
export const useDatasetRuns = ({
  datasetId,
  templateId,
}: {
  datasetId: string | null;
  templateId: string | null;
}) => {
  return useQuery({
    queryKey: [
      "datasetRuns",
      {
        datasetId,
        templateId,
      },
    ],
    queryFn: async () => {
      if (!datasetId) {
        return {};
      }
      if (!templateId) {
        return {};
      }
      const runs = await localForageStore.getItem<{
        [x: string]: DatasetRunType;
      }>(getDatasetRunsStorageKey(datasetId));
      if (!runs) {
        return {};
      }
      const allRuns = Object.values(runs);
      const uniqueDatasetRowIds = Array.from(
        new Set(allRuns.map((run) => run.datasetRowId))
      );
      const rows = uniqueDatasetRowIds.map((datasetRowId) => {
        const runsForDatasetRow = allRuns.filter(
          (run) =>
            run.datasetRowId === datasetRowId && run.templateId === templateId
        );
        return runsForDatasetRow.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
      }).filter(Boolean);
      return Object.fromEntries(rows.map((row) => [row.datasetRowId, row]));
    },
  });
};

export const useDatasetRowRuns = ({
  datasetId,
  templateId,
  datasetRowId,
}: {
  datasetId: string | null;
  templateId: string | null;
  datasetRowId: string | null;
}) => {
  return useQuery({
    queryKey: [
      "datasetRowRuns",
      {
        datasetId,
        templateId,
        datasetRowId,
      },
    ],
    queryFn: async () => {
      if (!datasetId) {
        return [];
      }
      const runs = await localForageStore.getItem<{
        [x: string]: DatasetRunType;
      }>(getDatasetRunsStorageKey(datasetId));
      if (!runs) {
        return [];
      }
      return Object.values(runs)
        .filter(
          (run) =>
            run.datasetRowId === datasetRowId && run.templateId === templateId
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },
  });
};

export const useCreateDatasetRun = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: CreateDatasetRunRequestBodyType) => {
      const newRun: DatasetRunType = {
        ...args,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const datasetRuns =
        (await localForageStore.getItem<{
          [x: string]: unknown;
        }>(getDatasetRunsStorageKey(args.datasetId))) ?? {};
      await localForageStore.setItem(getDatasetRunsStorageKey(args.datasetId), {
        ...datasetRuns,
        [newRun.id]: newRun,
      });
      const existingRuns = queryClient.getQueryData<{
        [x: string]: DatasetRunType;
      }>([
        "datasetRuns",
        {
          datasetId: args.datasetId,
          templateId: args.templateId,
        },
      ]);
      queryClient.setQueryData(
        [
          "datasetRuns",
          {
            datasetId: args.datasetId,
            templateId: args.templateId,
          },
        ],
        {
          ...existingRuns,
          [newRun.datasetRowId]: newRun,
        }
      );
      const existingRowRuns =
        queryClient.getQueryData<DatasetRunType[]>([
          "datasetRowRuns",
          {
            datasetId: args.datasetId,
            templateId: args.templateId,
            datasetRowId: args.datasetRowId,
          },
        ]) ?? [];
      queryClient.setQueryData(
        [
          "datasetRowRuns",
          {
            datasetId: args.datasetId,
            templateId: args.templateId,
            datasetRowId: args.datasetRowId,
          },
        ],
        [newRun, ...existingRowRuns]
      );
    },
  });
};
