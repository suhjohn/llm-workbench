import { useMutation } from "@tanstack/react-query";
import { useKeys } from "./useKeys";
import { useResources } from "./useResources";

export const useCreateCompletion = () => {
  const { data: resources } = useResources();
  const { data: localStorageKeys } = useKeys();
  return useMutation({
    mutationFn: async ({
      resourceId,
      params,
    }: {
      resourceId: string;
      params: unknown;
    }) => {
      const selectedResource = resources.find((r) => r.id === resourceId);
      if (!selectedResource) {
        throw new Error(`Resource with id ${resourceId} not found`);
      }
      if (!localStorageKeys) {
        throw new Error("API keys not found");
      }
      const resourceApiKey = localStorageKeys[selectedResource.providerId];
      if (!resourceApiKey) {
        throw new Error(
          `API keys for resource ${selectedResource.name} not found`
        );
      }

      const response = await fetch(selectedResource.path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resourceApiKey}`,
        },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`[${response.status}] ${responseText}`);
      }
      return response.json();
    },
  });
};
