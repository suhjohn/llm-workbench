import {
  useCreateDataset,
  useDatasets,
  useDeleteDataset,
} from "@/hooks/useDatasets";
import { useIndexSearchParams } from "@/hooks/useIndexSearchParams";
import { useNavigateToNewParams } from "@/hooks/useNavigation";
import { formatAbsoluteDate, formatAppleDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { DEFAULT_DATASET } from "@/types/dataset";
import { Loader2, Plus } from "lucide-react";
import { FC, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { DatasetDropdownButton } from "./DatasetDropdownButton";
import { Button } from "./ui/button";

type DatasetListProps = {
  onClickDataset: (id: string) => void;
};

export const DatasetList: FC<DatasetListProps> = ({ onClickDataset }) => {
  const { selectedDatasetId } = useIndexSearchParams();
  const { navigateToNewParams } = useNavigateToNewParams();
  const [openMoreActionIndex, setOpenMoreActionIndex] = useState<string | null>(
    null
  );
  const { data: datasets, isLoading } = useDatasets();
  const { mutateAsync: createDataset } = useCreateDataset();
  const { mutateAsync: deleteDataset } = useDeleteDataset();
  const handleCreateDataset = async () => {
    const now = new Date();
    const dataset = await createDataset({
      ...DEFAULT_DATASET,
      id: uuidv4(),
      name: `New Dataset - ${formatAbsoluteDate(now)}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    navigateToNewParams({
      datasetId: dataset.id,
      datasetView: "detail",
    });
  };
  const handleDeleteDataset = async (id: string) => {
    await deleteDataset(id);
    if (selectedDatasetId === id) {
      navigateToNewParams({
        datasetId: null,
        datasetView: "list",
      });
    }
  };
  return (
    <div className="w-full h-full flex flex-col overflow-auto">
      <div className="flex items-center justify-between p-2 sticky top-0 bg-background">
        <p className="text-xl font-semibold">Datasets</p>
        <Button className="px-2 space-x-2 w-auto" onClick={handleCreateDataset}>
          <Plus size={16} />
          <p>Create</p>
        </Button>
      </div>
      {isLoading && (
        <div className="py-4 flex justify-center">
          <Loader2 className="animate-spin" size={16} />
        </div>
      )}
      {datasets &&
        Object.values(datasets)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .map((dataset) => {
            return (
              <div
                key={dataset.id}
                className={cn(
                  "inline-flex",
                  "items-center",
                  "justify-center",
                  "whitespace-nowrap",
                  "rounded-md",
                  "text-sm",
                  "font-medium",
                  "ring-offset-background",
                  "transition-colors",
                  "focus-visible:outline-1",
                  "focus-visible:outline-blue-500",
                  "disabled:pointer-events-none",
                  "disabled:opacity-50",
                  "justify-between",
                  "px-2",
                  "py-1",
                  "min-h-10",
                  "flex",
                  "flex-shrink-0",
                  "text-left",
                  "items-center",
                  "hover:text-accent hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent/90",
                  "cursor-pointer"
                )}
                aria-selected={selectedDatasetId === dataset.id}
                onClick={() => {
                  onClickDataset(dataset.id);
                }}
              >
                <p className="text-left justify-start px-0 text-color-primary">
                  {dataset.name}
                </p>
                <div className="flex space-x-4 items-center">
                  <p className="text-xs text-muted-foreground">
                    {formatAppleDate(new Date(dataset.createdAt))}
                  </p>
                  <DatasetDropdownButton dataset={dataset} />
                </div>
              </div>
            );
          })}
    </div>
  );
};
