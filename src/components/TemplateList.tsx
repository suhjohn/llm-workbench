import {
  useCreateTemplate,
  useDeleteTemplate,
  useTemplates,
} from "@/hooks/useTemplates";
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

export const TemplateList: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTemplateId = searchParams.get("templateId");
  const [showMoreActionIndex, setShowMoreActionIndex] = useState<string | null>(
    null
  );
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
    });
  };
  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id);
    if (selectedTemplateId === id) router.push("/");
  };
  const handleSelectTemplate = (id: string) => {
    router.push(`/?templateId=${id}`);
  };
  return (
    <div className="min-w-48 h-full flex flex-col overflow-auto">
      <div className="flex items-center justify-between p-2 sticky top-0 bg-background">
        <p className="font-semibold text-xs text-gray-500 dark:text-gray-400">
          Templates
        </p>
        <Button className="px-0 py-0 h-auto p-1" onClick={handleCreateTemplate}>
          <Plus size={16} />
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
              className="justify-between px-2 h-10 flex-shrink-0"
              aria-selected={selectedTemplateId === template.id}
              onMouseEnter={() => {
                setShowMoreActionIndex(template.id);
              }}
              onMouseLeave={() => {
                setShowMoreActionIndex(null);
              }}
              onClick={() => {
                console.log("onClick", template.id);
                handleSelectTemplate(template.id);
              }}
            >
              <h2>{template.name}</h2>
              <DropdownMenu
                open={openMoreActionIndex === template.id}
                onOpenChange={(isOpen) => {
                  if (!isOpen) {
                    setOpenMoreActionIndex(null);
                  }
                }}
              >
                {(selectedTemplateId === template.id ||
                  openMoreActionIndex === template.id ||
                  showMoreActionIndex === template.id) && (
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
                )}
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
            </Button>
          );
        })}
    </div>
  );
};
