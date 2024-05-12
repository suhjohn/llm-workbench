import {
  useCreateDataset,
  useDatasets,
  useDeleteDataset,
} from "@/hooks/useDatasets";
import { formatAppleDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { DEFAULT_DATASET } from "@/types/dataset";
import { Loader2, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type DatasetListProps = {
  onClickDataset: (id: string) => void;
};

export const DatasetList: FC<DatasetListProps> = ({ onClickDataset }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDatasetId = searchParams.get("datasetId");
  const [openMoreActionIndex, setOpenMoreActionIndex] = useState<string | null>(
    null
  );
  const { data: datasets, isLoading } = useDatasets();
  const { mutateAsync: createDataset } = useCreateDataset();
  const { mutateAsync: deleteDataset } = useDeleteDataset();
  const handleCreateDataset = async () => {
    await createDataset({
      ...DEFAULT_DATASET,
      id: uuidv4(),
      name: "New Dataset",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };
  const handleDeleteDataset = async (id: string) => {
    await deleteDataset(id);
    const newSearchParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "datasetId") {
        newSearchParams.set(key, value);
      }
    });
    if (selectedDatasetId === id)
      router.push(`/?${newSearchParams.toString()}`);
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
              <Button
                key={dataset.id}
                variant="ghost"
                className={cn(
                  "justify-between",
                  "px-2",
                  "h-10",
                  "flex",
                  "flex-shrink-0",
                  "text-left",
                  "items-center"
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
                  <DropdownMenu
                    open={openMoreActionIndex === dataset.id}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setOpenMoreActionIndex(null);
                      }
                    }}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="px-0 py-0 h-auto p-1"
                        variant="secondary"
                        onClick={(e) => {
                          setOpenMoreActionIndex(dataset.id);
                          e.stopPropagation();
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        className="space-x-2 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDataset(dataset.id);
                        }}
                      >
                        <Trash size={16} />
                        <p>Delete</p>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Button>
            );
          })}
    </div>
  );
};
