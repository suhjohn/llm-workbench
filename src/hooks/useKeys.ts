import { localForageStore } from "@/lib/localforage";
import { useQuery } from "@tanstack/react-query";

export const KEYS_QUERY_KEY = "keys";

export const KEYS_LOCAL_STORAGE_KEY = "apiKeys";

export const useKeys = () => {
  return useQuery({
    queryKey: [KEYS_QUERY_KEY],
    queryFn: async () => {
      const keys = await localForageStore.getItem<{ [x: string]: string }>(
        KEYS_LOCAL_STORAGE_KEY
      );
      return keys || {};
    },
  });
};
