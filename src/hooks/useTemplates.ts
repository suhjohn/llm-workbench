import { localForageStore } from "@/lib/localforage";
import {
  PromptTemplateDatasetSchema,
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

export const getTemplateDatasetsLocalStorageKey = (templateId: string) =>
  `promptTemplateDatasets-${templateId}`;

export const useTemplates = () => {
  return useQuery({
    queryKey: [TEMPLATES_QUERY_KEY],
    queryFn: async () => {
      const templates = await localForageStore.getItem<{
        [x: string]: unknown;
      }>(TEMPLATES_LOCAL_STORAGE_KEY);
      if (!templates) {
        return {};
      }
      return Object.fromEntries(
        Object.entries(templates).map(([id, template]) => [
          id,
          PromptTemplateSchema.parse(template),
        ]) ?? []
      );
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
      await localForageStore.setItem(TEMPLATES_LOCAL_STORAGE_KEY, {
        ...templates,
        [template.id]: template,
      });
      queryClient.setQueryData([TEMPLATES_QUERY_KEY], {
        ...templates,
        [template.id]: template,
      });
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
      queryClient.setQueryData([TEMPLATES_QUERY_KEY], {
        ...templates,
        [template.id]: template,
      });
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
      queryClient.setQueryData([TEMPLATES_QUERY_KEY], templates);
    },
  });
};

export const useTemplateDatasets = (templateId: string) => {
  return useQuery({
    queryKey: getTemplateDatasetsQueryKey(templateId),
    queryFn: async () => {
      const templateDatasetsTable = await localForageStore.getItem<{
        [x: string]: any[];
      }>(getTemplateDatasetsLocalStorageKey(templateId));
      if (!templateDatasetsTable) {
        return [];
      }
      const datasetTable = await localForageStore.getItem<{
        [x: string]: any;
      }>(DATASETS_LOCAL_STORAGE_KEY);
      if (!datasetTable) {
        return [];
      }
      const templateDatasets = templateDatasetsTable[templateId];
      if (!templateDatasets) {
        return [];
      }
      return templateDatasets.map((templateDataset) =>
        PromptTemplateDatasetSchema.parse({
          ...templateDataset,
          dataset: datasetTable[templateDataset.datasetId],
        })
      ) as PromptTemplateDatasetType[];
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
        (await localForageStore.getItem<{
          [x: string]: any;
        }>(getTemplateDatasetsLocalStorageKey(templateId))) ?? {};
      const existingList = templateDatasetsTable[templateId] as any[];
      if (existingList) {
        if (existingList.find((item: any) => item.datasetId === datasetId)) {
          return;
        }
      }
      templateDatasetsTable[templateId] = [
        ...(templateDatasetsTable[templateId] ?? []),
        {
          id: uuidv4(),
          promptTemplateId: templateId,
          datasetId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      await localForageStore.setItem(
        getTemplateDatasetsLocalStorageKey(templateId),
        templateDatasetsTable
      );
      queryClient.resetQueries({
        queryKey: getTemplateDatasetsQueryKey(templateId),
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
        (await localForageStore.getItem<{
          [x: string]: any;
        }>(getTemplateDatasetsLocalStorageKey(templateId))) ?? {};
      const existingList = templateDatasetsTable[templateId] as any[];
      if (existingList) {
        templateDatasetsTable[templateId] = existingList.filter(
          (item: any) => item.datasetId !== datasetId
        );
        await localForageStore.setItem(
          getTemplateDatasetsLocalStorageKey(templateId),
          templateDatasetsTable
        );
        queryClient.setQueryData(
          getTemplateDatasetsQueryKey(templateId),
          templateDatasetsTable[templateId]
        );
      }
    },
  });
};
