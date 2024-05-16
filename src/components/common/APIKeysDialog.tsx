import { KEYS_LOCAL_STORAGE_KEY, useKeys } from "@/hooks/useKeys";
import { useProviders } from "@/hooks/useProviders";
import { localForageStore } from "@/lib/localforage";
import { cn } from "@/lib/utils";
import { InfoIcon, KeyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { PasswordInput } from "./PasswordInput";

export const APIKeysDialog = () => {
  const { data: providers } = useProviders();
  const [apiKeys, setApiKeys] = useState<{ [x: string]: string }>({});
  const [saved, setSaved] = useState(false);
  const { data: localStorageKeys, refetch } = useKeys();
  const handleSetApiKeys = async (apiKeys: { [x: string]: string }) => {
    await localForageStore.setItem(KEYS_LOCAL_STORAGE_KEY, apiKeys);
    setApiKeys(apiKeys);
    setSaved(true);
    await refetch();
  };
  useEffect(() => {
    if (localStorageKeys !== undefined) {
      setApiKeys(localStorageKeys);
    }
  }, [localStorageKeys]);

  const keys = providers.map((provider) => ({
    id: provider.id,
    name: provider.name,
    label: provider.name.toLowerCase(),
  }));

  setTimeout(() => setSaved(false), 3000);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="space-x-2">
          <KeyIcon size={16} />
          <p className="hidden md:block">API Keys</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-md">
        <DialogHeader>
          <DialogTitle>
            <p>API Keys</p>
          </DialogTitle>
          <DialogDescription className="flex justify-between items-center">
            <p>Add your authentication information to access LLM APIs.</p>
            {saved && <p className="text-xs">Saved</p>}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 w-full">
          <div
            className={cn(
              "dark:bg-gray-900",
              "bg-gray-100",
              "rounded-md",
              "p-4",
              "flex",
              "space-x-4",
              "items-start"
            )}
          >
            <InfoIcon size={16} className="flex-shrink-0" />
            <p className="text-sm">
              {`We don't store your API keys on a server. They are stored in your
              browser's local storage and make the requests client side.`}
            </p>
          </div>
          {keys.map((key) => (
            <div
              className="grid grid-cols-5 items-center gap-4"
              key={key.label}
            >
              <Label htmlFor={key.label} className="text-right">
                {key.name}
              </Label>
              <PasswordInput
                id={key.id}
                value={apiKeys[key.id] || ""}
                onChange={(event) => {
                  handleSetApiKeys({
                    ...apiKeys,
                    [key.id]: event.target.value,
                  });
                }}
                rootClassName="col-span-4"
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
