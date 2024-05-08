"use client";
import { TopNavigation } from "@/components/common/TopNavigation";
import { useCookieConfigContext } from "@/hooks/useCookieContext";
import {
  useBulkUpdateDatasetItems,
  useCreateDatasetItem,
  useDatasetItems,
  useDatasets,
  useDeleteDatasetItem,
  useUpdateDataset,
  useUpdateDatasetItem,
} from "@/hooks/useDatasets";
import { useTemplates, useUpdateTemplate } from "@/hooks/useTemplates";
import { cn } from "@/lib/utils";
import { DEFAULT_DATASET, DatasetItemType, DatasetType } from "@/types/dataset";
import { DEFAULT_TEMPLATE, PromptTemplateType } from "@/types/prompt";
import { AlignHorizontalDistributeCenter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { v4 as uuidv4 } from "uuid";
import { DatasetList } from "./DatasetList";
import { DatasetSection } from "./IndexDatasetSection";
import { TemplateSection } from "./IndexTemplateSection";
import { TemplateList } from "./TemplateList";
import { Button } from "./ui/button";

export default function IndexPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { config, setConfig } = useCookieConfigContext();
  const [width, setWidth] = useState<number>(
    config.indexHorizontalDividerWidth ?? 0
  );
  const isResized = useRef(false);
  useEffect(() => {
    window.addEventListener("mousemove", (e) => {
      if (!isResized.current) {
        return;
      }
      const env = process.env.NODE_ENV;
      const nextWidth =
        env === "development"
          ? (prevWidth: number) => {
              const newWidth = prevWidth - e.movementX;
              setConfig("indexHorizontalDividerWidth", newWidth);
              return newWidth;
            }
          : (prevWidth: number) => {
              // * 2 is because the boxes are under flex and with flex-shrink you need this hack
              const newWidth = prevWidth - e.movementX * 2;
              setConfig("indexHorizontalDividerWidth", newWidth);
              return newWidth;
            };
      setWidth(nextWidth);
    });
    window.addEventListener("mouseup", () => {
      isResized.current = false;
    });
  }, []);

  const templateView = searchParams.get("templateView") ?? "detail"; // list or detail
  const datasetView = searchParams.get("datasetView") ?? "detail"; // list or detail
  const selectedTemplateId = searchParams.get("templateId");
  const selectedDatasetId = searchParams.get("datasetId");

  const [template, setTemplate] = useState<PromptTemplateType>({
    ...DEFAULT_TEMPLATE,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [dataset, setDataset] = useState<DatasetType>({
    ...DEFAULT_DATASET,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [datasetItems, setDatasetItems] = useState<DatasetItemType[]>([]);
  const { data: templates } = useTemplates();
  const { data: datasets } = useDatasets();
  const { data: fetchedDatasetItems } = useDatasetItems(selectedDatasetId);

  useEffect(() => {
    if (selectedTemplateId === template.id) {
      return;
    }
    if (templates !== undefined && selectedTemplateId !== null) {
      const selectedTemplate = templates[selectedTemplateId];
      if (selectedTemplate) {
        setTemplate(selectedTemplate);
      }
    }
  }, [template, selectedTemplateId, templates, setTemplate]);

  useEffect(() => {
    if (datasets !== undefined && selectedDatasetId !== null) {
      const selectedDataset = datasets[selectedDatasetId];
      if (selectedDataset) {
        setDataset(selectedDataset);
      }
    }
  }, [selectedDatasetId, datasets, setDataset]);
  useEffect(() => {
    if (selectedDatasetId === null) {
      setDatasetItems([]);
    }
    if (selectedDatasetId !== null && fetchedDatasetItems !== undefined) {
      setDatasetItems(fetchedDatasetItems);
    }
  }, [selectedDatasetId, fetchedDatasetItems, setDatasetItems]);

  const { mutateAsync: updateTemplate } = useUpdateTemplate();
  const { mutateAsync: updateDataset } = useUpdateDataset();
  const { mutateAsync: updateDatasetItem } = useUpdateDatasetItem();
  const { mutateAsync: bulkUpdateDatasetItems } = useBulkUpdateDatasetItems();
  const { mutateAsync: createDatasetItem } = useCreateDatasetItem();
  const { mutateAsync: deleteDatasetItem } = useDeleteDatasetItem();

  const debouncedUpdateTemplate = useDebounceCallback(updateTemplate, 500);
  const debouncedUpdateDataset = useDebounceCallback(updateDataset, 500);

  const handleUpdateTemplate = (newTemplate: PromptTemplateType) => {
    setTemplate(newTemplate);
    debouncedUpdateTemplate(newTemplate);
    if (selectedTemplateId !== newTemplate.id)
      router.push(`/?templateId=${newTemplate.id}`);
  };

  const handleClickBackDataset = () => {
    const newSearchParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "datasetView" && key !== "datasetId") {
        newSearchParams.set(key, value);
      }
    });
    newSearchParams.set("datasetView", "list");
    router.push(`/?${newSearchParams.toString()}`);
  };

  const handleClickBackTemplate = () => {
    const newSearchParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "templateView" && key !== "templateId") {
        newSearchParams.set(key, value);
      }
    });
    newSearchParams.set("templateView", "list");
    router.push(`/?${newSearchParams.toString()}`);
  };

  const handleClickDataset = (id: string) => {
    const newSearchParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "datasetId") {
        newSearchParams.set(key, value);
      }
    });
    newSearchParams.set("datasetId", id);
    newSearchParams.set("datasetView", "detail");
    router.push(`/?${newSearchParams.toString()}`);
  };

  const handleClickTemplate = (id: string) => {
    const newSearchParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "templateId") {
        newSearchParams.set(key, value);
      }
    });
    newSearchParams.set("templateId", id);
    newSearchParams.set("templateView", "detail");
    router.push(`/?${newSearchParams.toString()}`);
  };

  const handleUpdateDataset = (newDataset: DatasetType) => {
    setDataset(newDataset);
    debouncedUpdateDataset(newDataset);
    if (selectedDatasetId !== newDataset.id)
      router.push(`/?datasetId=${newDataset.id}`);
  };

  const handleUpdateDatasetItem = ({
    action,
    datasetItem,
  }: {
    action: "create" | "update" | "delete";
    datasetItem: DatasetItemType;
  }) => {
    if (action === "create") {
      setDatasetItems((prev) => [...prev, datasetItem]);
      createDatasetItem({ datasetId: dataset.id });
    } else if (action === "update") {
      setDatasetItems((prev) =>
        prev.map((item) => (item.id === datasetItem.id ? datasetItem : item))
      );
      updateDatasetItem({ datasetItem });
    } else if (action === "delete") {
      setDatasetItems((prev) =>
        prev.filter((item) => item.id !== datasetItem.id)
      );
      deleteDatasetItem({
        datasetId: dataset.id,
        datasetItemId: datasetItem.id,
      });
    }
  };

  const handleBulkUpdateDatasetItems = (datasetItems: DatasetItemType[]) => {
    setDatasetItems((prev) =>
      prev.map((item) => {
        const newItem = datasetItems.find((newItem) => newItem.id === item.id);
        return newItem ?? item;
      })
    );
    bulkUpdateDatasetItems(datasetItems);
  };

  return (
    <div className={"flex relative flex-col space-y-0 md:h-[100dvh] w-[100vw]"}>
      <TopNavigation />
      <div
        className={cn(
          "w-full",
          "h-full",
          "flex",
          "gap-4",
          "p-4",
          "min-h-96",
          "md:min-h-auto",
          "md:p-2",
          "flex-col",
          "md:flex-row",
          "overflow-hidden"
        )}
      >
        <div
          className={cn("w-full", "flex", "space-x-2", "overflow-hidden")}
          style={{ width: `calc(100% - ${width}px)` }}
        >
          {templateView === "list" && (
            <TemplateList onClickTemplate={handleClickTemplate} />
          )}
          {templateView === "detail" && (
            <TemplateSection
              template={template}
              setTemplate={handleUpdateTemplate}
              onClickBack={handleClickBackTemplate}
            />
          )}
        </div>
        <div className="hidden md:flex space-y-2 h-full flex-col items-center">
          <Button
            className="w-auto px-1.5 py-1.5 w-auto h-auto"
            variant="outline"
            onClick={() => {
              setWidth(0);
              setConfig("indexHorizontalDividerWidth", 0);
            }}
          >
            <AlignHorizontalDistributeCenter size={12} />
          </Button>
          <div
            className="mx-[2px] h-full w-[2px] cursor-col-resize bg-muted hover:bg-blue-500 flex flex-shrink-0"
            onMouseDown={() => {
              isResized.current = true;
            }}
          />
        </div>
        <div
          className={cn(
            "w-full",
            "h-full",
            "flex",
            "space-x-2",
            "overflow-hidden",
            "min-h-96",
            "md:min-h-auto"
          )}
          style={{ width: `calc(100% + ${width}px)` }}
        >
          {datasetView === "list" && (
            <DatasetList onClickDataset={handleClickDataset} />
          )}
          {datasetView === "detail" && (
            <DatasetSection
              dataset={dataset}
              setDataset={handleUpdateDataset}
              datasetItems={datasetItems}
              setDatasetItem={handleUpdateDatasetItem}
              setDatasetItems={handleBulkUpdateDatasetItems}
              template={template}
              onClickBack={handleClickBackDataset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
