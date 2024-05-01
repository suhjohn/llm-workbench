"use client";
import { TopNavigation } from "@/components/common/TopNavigation";
import { useTemplates, useUpdateTemplate } from "@/hooks/useTemplates";
import { cn } from "@/lib/utils";
import { DEFAULT_TEMPLATE, PromptTemplateType } from "@/types/prompt";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { DatasetSection } from "./IndexDatasetSection";
import { TemplateSection } from "./IndexTemplateSection";
import { TemplateList } from "./TemplateList";

export default function IndexPage() {
  const { data: templates } = useTemplates();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTemplateId = searchParams.get("templateId");
  const [template, setTemplate] =
    useState<PromptTemplateType>(DEFAULT_TEMPLATE);
  const [promptParameters, setPromptParameters] = useState({});
  useEffect(() => {
    if (templates !== undefined && selectedTemplateId !== null) {
      const selectedTemplate = templates[selectedTemplateId];
      if (selectedTemplate) {
        setTemplate(selectedTemplate);
      }
    }
  }, [selectedTemplateId, templates, setTemplate]);
  const { mutateAsync: updateTemplate } = useUpdateTemplate();
  const debouncedUpdateTemplate = useDebounceCallback(updateTemplate, 500);
  const handleUpdateTemplate = (newTemplate: PromptTemplateType) => {
    setTemplate(newTemplate);
    debouncedUpdateTemplate(newTemplate);
    if (selectedTemplateId !== newTemplate.id)
      router.push(`/?templateId=${newTemplate.id}`);
  };
  return (
    <div className={"flex relative flex-col space-y-0 h-[100dvh]"}>
      <TopNavigation />
      <div
        className={cn(
          "h-full",
          "flex",
          "gap-4",
          "p-4",
          "overflow-hidden",
          "flex-col",
          "lg:flex-row"
        )}
      >
        <div
          className={cn(
            "w-full",
            "h-auto",
            "flex",
            "space-x-2",
            "overflow-hidden"
          )}
        >
          <TemplateList />
          <TemplateSection
            template={template}
            setTemplate={handleUpdateTemplate}
            promptParameters={promptParameters}
            setPromptParameters={setPromptParameters}
          />
        </div>
        <DatasetSection template={template} />
      </div>
    </div>
  );
}
