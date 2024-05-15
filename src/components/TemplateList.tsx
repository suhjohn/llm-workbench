import { useIndexSearchParams } from "@/hooks/useIndexSearchParams";
import { useNavigateToNewParams } from "@/hooks/useNavigation";
import { useCreateTemplate, useTemplates } from "@/hooks/useTemplates";
import { formatAbsoluteDate, formatAppleDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { DEFAULT_TEMPLATE } from "@/types/prompt";
import { Loader2, Plus } from "lucide-react";
import { FC } from "react";
import { v4 as uuidv4 } from "uuid";
import { TemplateDropdownButton } from "./TemplateDropdownButton";
import { Button } from "./ui/button";

type TemplateListProps = {
  onClickTemplate: (id: string) => void;
};

export const TemplateList: FC<TemplateListProps> = ({ onClickTemplate }) => {
  const { selectedTemplateId } = useIndexSearchParams();
  const { navigateToNewParams } = useNavigateToNewParams();
  const { data: templates, isLoading } = useTemplates();
  const { mutateAsync: createTemplate } = useCreateTemplate();
  const handleCreateTemplate = async () => {
    const now = new Date();
    const newTemplate = await createTemplate({
      ...DEFAULT_TEMPLATE,
      id: uuidv4(),
      name: `New template - ${formatAbsoluteDate(now)}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    navigateToNewParams({
      templateId: newTemplate.id,
      templateView: "detail",
    });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-auto">
      <div className="flex items-center justify-between p-2 sticky top-0 bg-background">
        <p className="text-xl font-semibold">Templates</p>
        <Button
          className="px-2 space-x-2 w-auto"
          onClick={handleCreateTemplate}
        >
          <Plus size={16} />
          <p>Create</p>
        </Button>
      </div>
      {isLoading && (
        <div className="py-4 flex justify-center">
          <Loader2 className="animate-spin" size={16} />
        </div>
      )}
      {templates?.map((template) => {
        return (
          <div
            key={template.id}
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
            aria-selected={selectedTemplateId === template.id}
            onClick={() => {
              onClickTemplate(template.id);
            }}
          >
            <p
              className={cn(
                "text-left justify-start px-0 text-color-primary",
                "whitespace-pre-wrap"
              )}
            >
              {template.name}
            </p>
            <div className="flex space-x-4 items-center">
              <p className="text-xs text-muted-foreground">
                {formatAppleDate(new Date(template.createdAt))}
              </p>
              <TemplateDropdownButton template={template} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
