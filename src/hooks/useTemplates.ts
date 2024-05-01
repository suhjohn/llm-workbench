import { localForageStore } from "@/lib/localforage";
import { PromptTemplateSchema, PromptTemplateType } from "@/types/prompt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const TEMPLATES_QUERY_KEY = "promptTemplates";

export const TEMPLATES_LOCAL_STORAGE_KEY = "promptTemplates";

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
