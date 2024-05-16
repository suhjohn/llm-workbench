import { localForageStore } from "@/lib/localforage";
import { useQuery } from "@tanstack/react-query";

export const RUN_CONFIG_QUERY_KEY = "runConfig";

export const RUN_CONFIG_LOCAL_STORAGE_KEY = "runConfig";

export type RunConfig = {
  parallelism: number;
};

export const useRunConfig = () => {
  return useQuery({
    queryKey: [RUN_CONFIG_QUERY_KEY],
    queryFn: async () => {
      const config = await localForageStore.getItem<RunConfig>(
        RUN_CONFIG_LOCAL_STORAGE_KEY
      );
      return (
        (config as RunConfig) || {
          parallelism: 5,
        }
      );
    },
  });
};
