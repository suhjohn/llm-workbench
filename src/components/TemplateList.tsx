import {
  useCreateTemplate,
  useDeleteTemplate,
  useTemplates,
} from "@/hooks/useTemplates";
import { formatAppleDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { DEFAULT_TEMPLATE } from "@/types/prompt";
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

type TemplateListProps = {
  onClickTemplate: (id: string) => void;
};

export const TemplateList: FC<TemplateListProps> = ({ onClickTemplate }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTemplateId = searchParams.get("templateId");
  const [openMoreActionIndex, setOpenMoreActionIndex] = useState<string | null>(
    null
  );
  const { data: templates, isLoading } = useTemplates();
  const { mutateAsync: createTemplate } = useCreateTemplate();
  const { mutateAsync: deleteTemplate } = useDeleteTemplate();
  const handleCreateTemplate = async () => {
    await createTemplate({
      ...DEFAULT_TEMPLATE,
      id: uuidv4(),
      name: "New Template",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };
  const handleDeleteTemplate = async (id: string) => {
    const newSearchParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "templateId") {
        newSearchParams.set(key, value);
      }
    });
    await deleteTemplate(id);
    if (selectedTemplateId === id)
      router.push(`/?${newSearchParams.toString()}`);
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
      {templates &&
        Object.values(templates).map((template) => {
          return (
            <Button
              key={template.id}
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
              aria-selected={selectedTemplateId === template.id}
              onClick={() => {
                onClickTemplate(template.id);
              }}
            >
              <p className="text-left justify-start px-0 text-color-primary">
                {template.name}
              </p>
              <div className="flex space-x-4 items-center">
                <p className="text-xs text-muted-foreground">
                  {formatAppleDate(new Date(template.createdAt))}
                </p>
                <DropdownMenu
                  open={openMoreActionIndex === template.id}
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
                        setOpenMoreActionIndex(template.id);
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
                        handleDeleteTemplate(template.id);
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
