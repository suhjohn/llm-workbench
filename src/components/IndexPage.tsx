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
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DatasetList } from "./DatasetList";
import { DatasetSection } from "./IndexDatasetSection";
import { TemplateSection } from "./IndexTemplateSection";
import { TemplateList } from "./TemplateList";

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
  const [isRendered, setIsRendered] = useState(false);
  const [template, setTemplate] = useState<PromptTemplateType>({
    ...DEFAULT_TEMPLATE,
  });
  const [dataset, setDataset] = useState<DatasetType>({
    ...DEFAULT_DATASET,
  });
  const { data: templates } = useTemplates();
  const { data: datasets } = useDatasets();
  useEffect(() => {
    setIsRendered(true);
  }, []);

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
    if (selectedTemplateId === null) {
      setTemplate(DEFAULT_TEMPLATE);
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

  const handleUpdateTemplate = (newTemplate: PromptTemplateType) => {
    setTemplate(newTemplate);
    updateTemplate(newTemplate);

    navigateToNewParams({ templateId: newTemplate.id });
  };

  const handleClickBackDataset = () => {
    navigateToNewParams({ datasetView: "list", datasetId: null });
  };

  const handleClickBackTemplate = () => {
    setTemplate(DEFAULT_TEMPLATE);
    navigateToNewParams({ templateView: "list", templateId: null });
  };

  const handleClickDataset = (id: string) => {
    navigateToNewParams({ datasetId: id, datasetView: "detail" });
  };

  const handleClickTemplate = (id: string) => {
    navigateToNewParams({ templateId: id, templateView: "detail" });
  };

  const handleUpdateDataset = (newDataset: DatasetType) => {
    setDataset(newDataset);
    updateDataset(newDataset);
    navigateToNewParams({ datasetId: newDataset.id });
  };

  const isLoadingTemplate =
    templateView === "detail" &&
    selectedTemplateId !== null &&
    selectedTemplateId !== template.id;
  return (
    <div className={"flex relative flex-col space-y-0 md:h-[100dvh] w-[100vw]"}>
      <TopNavigation />
      {isRendered === false ? (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
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
                isLoadingTemplate={isLoadingTemplate}
                template={template}
                setTemplate={handleUpdateTemplate}
                onClickBack={handleClickBackTemplate}
              />
            )}
          </div>
          <div className="hidden md:flex space-y-2 h-full flex-col items-center">
            <div
              className="mx-[2px] h-full w-[2px] cursor-col-resize bg-muted hover:bg-blue-500 hover:w-[4px] hover:mx-[1px] transition duration-200"
              onMouseDown={() => {
                isResized.current = true;
              }}
              onDoubleClick={() => {
                setWidth(0);
                setConfig("indexHorizontalDividerWidth", 0);
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
      )}
    </div>
  );
}
