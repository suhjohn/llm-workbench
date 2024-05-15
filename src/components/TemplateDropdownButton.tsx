import { useIndexSearchParams } from "@/hooks/useIndexSearchParams";
import { useNavigateToNewParams } from "@/hooks/useNavigation";
import { useCreateTemplate, useDeleteTemplate } from "@/hooks/useTemplates";
import { PromptTemplateType } from "@/types/prompt";
import { Copy, MoreHorizontal, Trash } from "lucide-react";
import { FC } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

type TemplateDropdownButtonProps = {
  template: PromptTemplateType;
};

export const TemplateDropdownButton: FC<TemplateDropdownButtonProps> = ({
  template,
}) => {
  const { selectedTemplateId } = useIndexSearchParams();
  const { navigateToNewParams } = useNavigateToNewParams();
  const { mutateAsync: createTemplate } = useCreateTemplate();
  const { mutateAsync: deleteTemplate } = useDeleteTemplate();

  const handleCopyTemplate = async () => {
    const now = new Date();
    const copiedTemplate = await createTemplate({
      ...template,
      id: uuidv4(),
      name: `${template.name} (Copy)`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    navigateToNewParams({
      templateId: copiedTemplate.id,
      templateView: "detail",
    });
  };

  const handleDeleteTemplate = async () => {
    await deleteTemplate(template.id);
    if (selectedTemplateId === template.id) {
      navigateToNewParams({
        templateId: null,
        templateView: "list",
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
          className="space-x-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCopyTemplate();
          }}
        >
          <Copy size={16} />
          <p>Copy</p>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="space-x-2 text-red-500"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDeleteTemplate();
          }}
        >
          <Trash size={16} />
          <p>Delete</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
