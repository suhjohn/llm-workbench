import localForage from "localforage";

export const localForageStore = localForage.createInstance({
  name: "PromptPlaygroundLocalStorageDB",
  version: 1.0,
  storeName: "PromptPlaygroundLocalStorage",
  driver: [localForage.INDEXEDDB],
});
