import {
  RUN_CONFIG_LOCAL_STORAGE_KEY,
  RunConfig,
  useRunConfig,
} from "@/hooks/useRunConfig";
import { localForageStore } from "@/lib/localforage";
import { FC, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type RunConfigDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const RunConfigDialog: FC<RunConfigDialogProps> = ({
  open,
  setOpen,
}) => {
  const [parallelism, setParallelism] = useState(5);
  const [saved, setSaved] = useState(false);
  const { data: runConfig, refetch } = useRunConfig();
  useEffect(() => {
    if (runConfig) {
      setParallelism(runConfig.parallelism);
    }
  }, [runConfig]);
  const handleSetConfig = async (config: RunConfig) => {
    await localForageStore.setItem(RUN_CONFIG_LOCAL_STORAGE_KEY, config);
    setParallelism(config.parallelism);
    setSaved(true);
    await refetch();
  };
  setTimeout(() => setSaved(false), 3000);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <p>Run configuration</p>
          </DialogTitle>
          <DialogDescription className="flex justify-between items-center">
            <p>Set the configuration for running the template.</p>
            {saved && <p className="text-xs">Saved</p>}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 w-full">
          <Label>Parallelism</Label>
          <Input
            value={parallelism}
            type="number"
            onChange={(e) => {
              handleSetConfig({ parallelism: parseInt(e.target.value) });
            }}
          />
        </div>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
};
