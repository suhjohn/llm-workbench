"use client";
import { TopNavigation } from "@/components/common/TopNavigation";
import { useCookieConfigContext } from "@/hooks/useCookieContext";
import { useDatasets, useUpdateDataset } from "@/hooks/useDatasets";
import { useIndexSearchParams } from "@/hooks/useIndexSearchParams";
import { useNavigateToNewParams } from "@/hooks/useNavigation";
import { useHorizontalResize } from "@/hooks/useResize";
import { useTemplates, useUpdateTemplate } from "@/hooks/useTemplates";
import { cn } from "@/lib/utils";
import { DEFAULT_DATASET, DatasetType } from "@/types/dataset";
import { DEFAULT_TEMPLATE, PromptTemplateType } from "@/types/prompt";
import { AlignHorizontalDistributeCenter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { v4 as uuidv4 } from "uuid";
import { DatasetList } from "./DatasetList";
import { DatasetSection } from "./IndexDatasetSection";
import { TemplateSection } from "./IndexTemplateSection";
import { TemplateList } from "./TemplateList";
import { Button } from "./ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function IndexPage() {
  const { templateView, datasetView, selectedTemplateId, selectedDatasetId } =
    useIndexSearchParams();
  const { config, setConfig } = useCookieConfigContext();
  const { width, setWidth, isResized } = useHorizontalResize({
    initialWidth: config.indexHorizontalDividerWidth ?? 0,
    onResize: (width) => {
      setConfig("indexHorizontalDividerWidth", width);
    },
  });

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
  const { data: templates } = useTemplates();
  const { data: datasets } = useDatasets();

  const templatesMap = useMemo(() => {
    return templates?.reduce((acc, template) => {
      acc[template.id] = template;
      return acc;
    }, {} as Record<string, PromptTemplateType>);
  }, [templates]);

  useEffect(() => {
    if (selectedTemplateId === template.id) {
      return;
    }
    if (templatesMap !== undefined && selectedTemplateId !== null) {
      const selectedTemplate = templatesMap[selectedTemplateId];
      if (selectedTemplate) {
        setTemplate(selectedTemplate);
      }
    }
  }, [template, selectedTemplateId, templatesMap, setTemplate]);
  useEffect(() => {
    if (datasets !== undefined && selectedDatasetId !== null) {
      const selectedDataset = datasets[selectedDatasetId];
      if (selectedDataset) {
        setDataset(selectedDataset);
      }
    }
  }, [selectedDatasetId, datasets, setDataset]);

  const { mutateAsync: updateTemplate } = useUpdateTemplate();
  const { mutateAsync: updateDataset } = useUpdateDataset();
  const { navigateToNewParams } = useNavigateToNewParams();
  
  const debouncedUpdateTemplate = useDebounceCallback(updateTemplate, 500);
  const debouncedUpdateDataset = useDebounceCallback(updateDataset, 500);

  const handleUpdateTemplate = (newTemplate: PromptTemplateType) => {
    setTemplate(newTemplate);
    debouncedUpdateTemplate(newTemplate);

    navigateToNewParams({ templateId: newTemplate.id });
  };

  const handleClickBackDataset = () => {
    navigateToNewParams({ datasetView: "list" });
  };

  const handleClickBackTemplate = () => {
    navigateToNewParams({ templateView: "list" });
  };

  const handleClickDataset = (id: string) => {
    navigateToNewParams({ datasetId: id, datasetView: "detail" });
  };

  const handleClickTemplate = (id: string) => {
    navigateToNewParams({ templateId: id, templateView: "detail" });
  };

  const handleUpdateDataset = (newDataset: DatasetType) => {
    setDataset(newDataset);
    debouncedUpdateDataset(newDataset);
    navigateToNewParams({ datasetId: newDataset.id });
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
              template={template}
              onClickTemplate={handleClickTemplate}
              onClickBack={handleClickBackDataset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
