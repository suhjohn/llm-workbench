import { useDeleteDataset } from "@/hooks/useDatasets";
import { useIndexSearchParams } from "@/hooks/useIndexSearchParams";
import { useNavigateToNewParams } from "@/hooks/useNavigation";
import { DatasetType } from "@/types/dataset";
import { MoreHorizontal, Trash } from "lucide-react";
import { FC } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type DatasetDropdownButtonProps = {
  dataset: DatasetType;
};

export const DatasetDropdownButton: FC<DatasetDropdownButtonProps> = ({
  dataset,
}) => {
  const { selectedDatasetId } = useIndexSearchParams();
  const { navigateToNewParams } = useNavigateToNewParams();
  const { mutateAsync: deleteDataset } = useDeleteDataset();
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="px-0 py-0 h-auto p-2"
          onClick={(e) => {
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
  );
};
