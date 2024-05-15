import { useSearchParams } from "next/navigation";

export const useIndexSearchParams = () => {
  const searchParams = useSearchParams();
  const templateView = searchParams.get("templateView") ?? "list"; // list or detail
  const datasetView = searchParams.get("datasetView") ?? "list"; // list or detail
  const selectedTemplateId = searchParams.get("templateId");
  const selectedDatasetId = searchParams.get("datasetId");

  return {
    templateView,
    datasetView,
    selectedTemplateId,
    selectedDatasetId,
  };
};
