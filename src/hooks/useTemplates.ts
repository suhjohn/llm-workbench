import { localForageStore } from "@/lib/localforage";
import {
  PromptTemplateDatasetType,
  PromptTemplateSchema,
  PromptTemplateType,
} from "@/types/prompt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { DATASETS_LOCAL_STORAGE_KEY } from "./useDatasets";

export const TEMPLATES_QUERY_KEY = "promptTemplates";

export const TEMPLATES_LOCAL_STORAGE_KEY = "promptTemplates";

export const getTemplateDatasetsQueryKey = (templateId: string) => [
  `promptTemplateDatasets`,
  templateId,
];

export const getTemplateDatasetsLocalStorageKey = () =>
  `promptTemplateDatasets`;

export const useTemplates = () => {
  return useQuery({
    queryKey: [TEMPLATES_QUERY_KEY],
    queryFn: async () => {
      const templates = await localForageStore.getItem<{
        [x: string]: unknown;
      }>(TEMPLATES_LOCAL_STORAGE_KEY);
      if (!templates) {
        return [];
      }
      return Object.values(templates)
        .map((template) => PromptTemplateSchema.parse(template))
        .sort((a, b) => {
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }) as PromptTemplateType[];
    },
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (template: PromptTemplateType) => {
      const templates =
        (await localForageStore.getItem<{
          [x: string]: unknown;
        }>(TEMPLATES_LOCAL_STORAGE_KEY)) ?? {};
      const newTemplate = {
        ...template,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await localForageStore.setItem(TEMPLATES_LOCAL_STORAGE_KEY, {
        ...templates,
        [newTemplate.id]: newTemplate,
      });
      const existingTemplates = queryClient.getQueryData([TEMPLATES_QUERY_KEY]);
      queryClient.setQueryData(
        [TEMPLATES_QUERY_KEY],
        [newTemplate, ...(existingTemplates as PromptTemplateType[])]
      );
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (template: PromptTemplateType) => {
      const templates =
        (await localForageStore.getItem<{
          [x: string]: unknown;
        }>(TEMPLATES_LOCAL_STORAGE_KEY)) ?? {};
      await localForageStore.setItem(TEMPLATES_LOCAL_STORAGE_KEY, {
        ...templates,
        [template.id]: template,
      });
      const existingTemplates = queryClient.getQueryData([TEMPLATES_QUERY_KEY]);
      queryClient.setQueryData(
        [TEMPLATES_QUERY_KEY],
        (existingTemplates as PromptTemplateType[]).map((t) =>
          t.id === template.id ? template : t
        )
      );
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const templates =
        (await localForageStore.getItem<{
          [x: string]: unknown;
        }>(TEMPLATES_LOCAL_STORAGE_KEY)) ?? {};
      delete templates[id];
      await localForageStore.setItem(TEMPLATES_LOCAL_STORAGE_KEY, templates);
      queryClient.setQueryData(
        [TEMPLATES_QUERY_KEY],
        Object.values(templates).map((template) =>
          PromptTemplateSchema.parse(template)
        )
      );
      const templateDatasetsTable = await localForageStore.getItem<
        PromptTemplateDatasetType[]
      >(getTemplateDatasetsLocalStorageKey());
      if (!templateDatasetsTable) {
        return;
      }
      const newTemplateDatasetsTable = templateDatasetsTable.filter(
        (item) => item.promptTemplateId !== id
      );
      await localForageStore.setItem(
        getTemplateDatasetsLocalStorageKey(),
        newTemplateDatasetsTable
      );
    },
  });
};

export const useTemplateDatasets = (templateId: string) => {
  return useQuery({
    queryKey: getTemplateDatasetsQueryKey(templateId),
    queryFn: async () => {
      const templateDatasetsTable = await localForageStore.getItem<
        PromptTemplateDatasetType[]
      >(getTemplateDatasetsLocalStorageKey());
      if (!templateDatasetsTable) {
        return [];
      }
      const datasetTable = await localForageStore.getItem<{
        [x: string]: any;
      }>(DATASETS_LOCAL_STORAGE_KEY);
      if (!datasetTable) {
        return [];
      }
      const templateTable = await localForageStore.getItem<{
        [x: string]: any;
      }>(TEMPLATES_LOCAL_STORAGE_KEY);
      if (!templateTable) {
        return [];
      }
      const templateDatasets = templateDatasetsTable.filter(
        (templateDataset) => templateDataset.promptTemplateId === templateId
      );
      if (!templateDatasets) {
        return [];
      }
      return templateDatasets.map((templateDataset) => {
        return {
          ...templateDataset,
          dataset: datasetTable[templateDataset.datasetId],
          template: templateTable[templateDataset.promptTemplateId],
        };
      });
    },
  });
};

export const getDatasetTemplatesQueryKey = (datasetId: string) => [
  `datasetTemplates`,
  datasetId,
];

export const useDatasetTemplates = (datasetId: string) => {
  return useQuery({
    queryKey: getDatasetTemplatesQueryKey(datasetId),
    queryFn: async () => {
      const templateDatasetsTable = await localForageStore.getItem<
        PromptTemplateDatasetType[]
      >(getTemplateDatasetsLocalStorageKey());
      if (!templateDatasetsTable) {
        return [];
      }
      const datasetTable = await localForageStore.getItem<{
        [x: string]: any;
      }>(DATASETS_LOCAL_STORAGE_KEY);
      if (!datasetTable) {
        return [];
      }
      const templateTable = await localForageStore.getItem<{
        [x: string]: any;
      }>(TEMPLATES_LOCAL_STORAGE_KEY);
      if (!templateTable) {
        return [];
      }
      return templateDatasetsTable
        .filter((templateDataset) => templateDataset.datasetId === datasetId)
        .map((templateDataset) => {
          return {
            ...templateDataset,
            dataset: datasetTable[templateDataset.datasetId],
            template: templateTable[templateDataset.promptTemplateId],
          };
        })
        .filter(
          (templateDataset) =>
            templateDataset.template !== undefined &&
            templateDataset.dataset !== undefined
        );
    },
  });
};

export const useCreateTemplateDataset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      templateId,
      datasetId,
    }: {
      templateId: string;
      datasetId: string;
    }) => {
      const templateDatasetsTable =
        (await localForageStore.getItem<PromptTemplateDatasetType[]>(
          getTemplateDatasetsLocalStorageKey()
        )) ?? [];
      if (
        templateDatasetsTable.find(
          (item) =>
            item.promptTemplateId === templateId && item.datasetId === datasetId
        )
      ) {
        return;
      }
      const newTemplateDatasetsTable = [
        ...templateDatasetsTable,
        {
          id: uuidv4(),
          promptTemplateId: templateId,
          datasetId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      await localForageStore.setItem(
        getTemplateDatasetsLocalStorageKey(),
        newTemplateDatasetsTable
      );
      queryClient.resetQueries({
        queryKey: getTemplateDatasetsQueryKey(templateId),
      });
      queryClient.resetQueries({
        queryKey: getDatasetTemplatesQueryKey(datasetId),
      });
    },
  });
};

export const useDeleteTemplateDataset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      templateId,
      datasetId,
    }: {
      templateId: string;
      datasetId: string;
    }) => {
      const templateDatasetsTable =
        (await localForageStore.getItem<PromptTemplateDatasetType[]>(
          getTemplateDatasetsLocalStorageKey()
        )) ?? [];
      const newTemplateDatasetsTable = templateDatasetsTable.filter(
        (item) =>
          item.promptTemplateId !== templateId || item.datasetId !== datasetId
      );
      await localForageStore.setItem(
        getTemplateDatasetsLocalStorageKey(),
        newTemplateDatasetsTable
      );
      queryClient.resetQueries({
        queryKey: getTemplateDatasetsQueryKey(templateId),
      });
      queryClient.resetQueries({
        queryKey: getDatasetTemplatesQueryKey(datasetId),
      });
    },
  });
};
