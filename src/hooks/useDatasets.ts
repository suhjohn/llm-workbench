import { localForageStore } from "@/lib/localforage";
import {
  DatasetDataSchema,
  DatasetDataType,
  DatasetSchema,
  DatasetType,
  OutputFieldType,
} from "@/types/dataset";
import { PromptTemplateDatasetType } from "@/types/prompt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  getTemplateDatasetsLocalStorageKey,
  getTemplateDatasetsQueryKey,
} from "./useTemplates";

export const DATASETS_QUERY_KEY = "datasets";

export const DATASETS_LOCAL_STORAGE_KEY = "datasets";

export const DATASET_OBJ_QUERY_KEY = "datasetItems";

export const getDatasetObjStorageKey = (datasetId: string) =>
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
      const datasetObj = {
        id: uuidv4(),
        datasetId: dataset.id,
        parameterFields: [],
        outputFields: [
          {
            name: "output",
            path: "",
          },
        ],
        data: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await localForageStore.setItem(
        getDatasetObjStorageKey(dataset.id),
        datasetObj
      );
      queryClient.setQueryData(
        [DATASET_OBJ_QUERY_KEY, { datasetId: dataset.id }],
        datasetObj
      );
      return dataset;
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

      /** Cascade delete template datasets */
      const templateDatasetsTable = await localForageStore.getItem<
        PromptTemplateDatasetType[]
      >(getTemplateDatasetsLocalStorageKey());
      if (!templateDatasetsTable) {
        return;
      }
      const updatedTemplateDatasetsTable = templateDatasetsTable.filter(
        (item) => item.datasetId !== datasetId
      );
      const relatedTemplateIds = templateDatasetsTable
        .filter((item) => item.datasetId === datasetId)
        .map((item) => item.promptTemplateId);
      await localForageStore.setItem(
        getTemplateDatasetsLocalStorageKey(),
        updatedTemplateDatasetsTable
      );
      relatedTemplateIds.forEach((templateId) => {
        queryClient.resetQueries({
          queryKey: getTemplateDatasetsQueryKey(templateId),
        });
      });
    },
  });
};

export const useDatasetObj = (datasetId: string | null) => {
  return useQuery({
    queryKey: [DATASET_OBJ_QUERY_KEY, { datasetId }],
    queryFn: async () => {
      if (!datasetId) {
        return null;
      }
      const dataObj = await localForageStore.getItem<{
        [x: string]: unknown;
      }>(`${getDatasetObjStorageKey(datasetId)}`);
      if (!dataObj) {
        return null;
      }
      return DatasetDataSchema.parse(dataObj);
    },
  });
};

export const useDatasetObjById = ({
  datasetId,
}: {
  datasetId: string | null;
}) => {
  const [datasetObj, setDatasetObj] = useState<DatasetDataType>({
    id: uuidv4(),
    datasetId: datasetId ?? "",
    data: [],
    parameterFields: [],
    outputFields: [
      {
        name: "output",
        path: "",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const { data: datasetData } = useDatasetObj(datasetId);
  const { mutateAsync: callUpdateRow } = useUpdateDatasetRow();
  const { mutateAsync: callCreateRow } = useAddDatasetRow();
  const { mutateAsync: callDeleteRow } = useDeleteDatasetRow();
  const { mutateAsync: callAddColumns } = useAddDatasetColumns();
  const { mutateAsync: callUpdateColumn } = useUpdateDatasetColumn();
  const { mutateAsync: callRemoveColumns } = useRemoveDatasetColumns();
  const { mutateAsync: callUpdateOutputField } = useUpdateOutputField();
  useEffect(() => {
    if (datasetId && datasetData) {
      setDatasetObj(datasetData);
    } else {
      setDatasetObj({
        id: uuidv4(),
        datasetId: datasetId ?? "",
        parameterFields: [],
        outputFields: [
          {
            name: "output",
            path: "",
          },
        ],
        data: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [datasetId, datasetData]);

  const updateRow = async (index: number, args: Record<string, any>) => {
    setDatasetObj((prev) => {
      const data = [...prev.data];
      data[index] = {
        id: data[index].id,
        arguments: args,
      };
      return {
        ...prev,
        data,
      };
    });
    await callUpdateRow({
      datasetId: datasetObj.datasetId,
      data: { index, args },
    });
  };

  const createRow = async () => {
    const row = Object.fromEntries(
      datasetObj.parameterFields.map((fieldName) => [fieldName, ""])
    );
    setDatasetObj((prev) => {
      const data = [
        ...prev.data,
        {
          id: uuidv4(),
          arguments: row,
        },
      ];
      return {
        ...prev,
        data,
      };
    });
    await callCreateRow({ datasetId: datasetObj.datasetId, args: { row } });
  };

  const deleteRow = async (index: number) => {
    setDatasetObj((prev) => {
      const data = [...prev.data];
      data.splice(index, 1);
      return {
        ...prev,
        data,
      };
    });
    await callDeleteRow({ datasetId: datasetObj.datasetId, index });
  };
  const addColumns = async (columns: string[]) => {
    setDatasetObj((prev) => {
      const parameterFields = Array.from(
        new Set([...prev.parameterFields, ...columns])
      );
      return {
        ...prev,
        parameterFields,
      };
    });
    await callAddColumns({
      datasetId: datasetObj.datasetId,
      args: { columns },
    });
  };
  const removeColumns = async (columns: string[]) => {
    setDatasetObj((prev) => {
      const parameterFields = prev.parameterFields.filter(
        (field) => !columns.includes(field)
      );
      return {
        ...prev,
        parameterFields,
      };
    });
    await callRemoveColumns({
      datasetId: datasetObj.datasetId,
      args: { columns },
    });
  };
  const updateOutputField = async (
    index: number,
    outputField: OutputFieldType
  ) => {
    setDatasetObj((prev) => {
      const outputFields = [...prev.outputFields];
      outputFields[index] = outputField;
      return {
        ...prev,
        outputFields,
      };
    });
    await callUpdateOutputField({
      datasetId: datasetObj.datasetId,
      args: { index, outputField },
    });
  };

  const updateColumn = async (index: number, column: string) => {
    setDatasetObj((prev) => {
      const parameterFields = [...prev.parameterFields];
      parameterFields[index] = column;
      return {
        ...prev,
        parameterFields,
      };
    });
    await callUpdateColumn({
      datasetId: datasetObj.datasetId,
      args: { index, column },
    });
  };
  return {
    datasetObj,
    addColumns,
    updateRow,
    createRow,
    deleteRow,
    removeColumns,
    updateColumn,
    updateOutputField,
  };
};

export const useAddDatasetColumns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      datasetId,
      args,
    }: {
      datasetId: string;
      args: {
        columns: string[];
      };
    }) => {
      const dataObj = await localForageStore.getItem<{
        [x: string]: unknown;
      }>(`${getDatasetObjStorageKey(datasetId)}`);
      const parsed = DatasetDataSchema.parse(dataObj);
      parsed.parameterFields = Array.from(
        new Set([...parsed.parameterFields, ...args.columns])
      );
      await localForageStore.setItem(
        `${getDatasetObjStorageKey(datasetId)}`,
        parsed
      );
      queryClient.setQueryData([DATASET_OBJ_QUERY_KEY, { datasetId }], parsed);
    },
  });
};

export const useUpdateDatasetColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      datasetId,
      args,
    }: {
      datasetId: string;
      args: {
        index: number;
        column: string;
      };
    }) => {
      const dataObj = await localForageStore.getItem<{
        [x: string]: unknown;
      }>(`${getDatasetObjStorageKey(datasetId)}`);
      const parsed = DatasetDataSchema.parse(dataObj);
      parsed.data = parsed.data.map((row) => {
        const newArguments = { ...row.arguments };
        const oldColumn = parsed.parameterFields[args.index];
        const newColumn = args.column;
        newArguments[newColumn] = newArguments[oldColumn];
        delete newArguments[oldColumn];
        return {
          id: row.id,
          arguments: newArguments,
        };
      });
      parsed.parameterFields[args.index] = args.column;
      await localForageStore.setItem(
        `${getDatasetObjStorageKey(datasetId)}`,
        parsed
      );
      queryClient.setQueryData([DATASET_OBJ_QUERY_KEY, { datasetId }], parsed);
    },
  });
};

export const useRemoveDatasetColumns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      datasetId,
      args,
    }: {
      datasetId: string;
      args: {
        columns: string[];
      };
    }) => {
      const dataObj = await localForageStore.getItem<{
        [x: string]: unknown;
      }>(`${getDatasetObjStorageKey(datasetId)}`);
      const parsed = DatasetDataSchema.parse(dataObj);
      parsed.parameterFields = parsed.parameterFields.filter(
        (field) => !args.columns.includes(field)
      );
      parsed.data = parsed.data.map((row) => ({
        id: row.id,
        arguments: Object.fromEntries(
          Object.entries(row.arguments).filter(
            ([key]) => !args.columns.includes(key)
          )
        ),
      }));
      await localForageStore.setItem(
        `${getDatasetObjStorageKey(datasetId)}`,
        parsed
      );
      queryClient.setQueryData([DATASET_OBJ_QUERY_KEY, { datasetId }], parsed);
    },
  });
};

export const useAddDatasetRow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      datasetId,
      args,
    }: {
      datasetId: string;
      args: {
        row: Record<string, string>;
      };
    }) => {
      const newArguments = args.row;
      const dataObj = await localForageStore.getItem<{
        [x: string]: unknown;
      }>(`${getDatasetObjStorageKey(datasetId)}`);
      console.log(dataObj);
      const parsed = DatasetDataSchema.parse(dataObj);
      parsed.data.push({
        id: uuidv4(),
        arguments: newArguments,
      });
      await localForageStore.setItem(`${getDatasetObjStorageKey(datasetId)}`, {
        ...parsed,
        data: parsed.data,
      });
      queryClient.setQueryData([DATASET_OBJ_QUERY_KEY, { datasetId }], {
        ...parsed,
        data: parsed.data,
      });
    },
  });
};

export const useUpdateDatasetRow = () => {
  return useMutation({
    mutationFn: async ({
      datasetId,
      data,
    }: {
      datasetId: string;
      data: {
        index: number;
        args: Record<string, string>;
      };
    }) => {
      const { index, args } = data;
      const dataObj =
        (await localForageStore.getItem<{
          [x: string]: unknown;
        }>(`${getDatasetObjStorageKey(datasetId)}`)) ?? {};
      const parsed = DatasetDataSchema.parse(dataObj);
      parsed.data[index] = {
        id: parsed.data[index].id,
        arguments: args,
      };
      await localForageStore.setItem(`${getDatasetObjStorageKey(datasetId)}`, {
        ...parsed,
        data: parsed.data,
      });
    },
  });
};

export const useUpdateOutputField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      datasetId,
      args,
    }: {
      datasetId: string;
      args: {
        index: number;
        outputField: OutputFieldType;
      };
    }) => {
      const dataObj =
        (await localForageStore.getItem<{
          [x: string]: unknown;
        }>(`${getDatasetObjStorageKey(datasetId)}`)) ?? {};
      const parsed = DatasetDataSchema.parse(dataObj);
      parsed.outputFields[args.index] = args.outputField;
      await localForageStore.setItem(`${getDatasetObjStorageKey(datasetId)}`, {
        ...parsed,
        outputFields: parsed.outputFields,
      });
      queryClient.setQueryData([DATASET_OBJ_QUERY_KEY, { datasetId }], {
        ...parsed,
        outputFields: parsed.outputFields,
      });
    },
  });
};

export const useDeleteDatasetRow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      datasetId,
      index,
    }: {
      datasetId: string;
      index: number;
    }) => {
      const dataObj =
        (await localForageStore.getItem<{
          [x: string]: unknown;
        }>(`${getDatasetObjStorageKey(datasetId)}`)) ?? {};
      const parsed = DatasetDataSchema.parse(dataObj);
      parsed.data.splice(index, 1);
      await localForageStore.setItem(`${getDatasetObjStorageKey(datasetId)}`, {
        ...parsed,
        data: parsed.data,
      });
      queryClient.setQueryData([DATASET_OBJ_QUERY_KEY, { datasetId }], {
        ...parsed,
        data: parsed.data,
      });
    },
  });
};
