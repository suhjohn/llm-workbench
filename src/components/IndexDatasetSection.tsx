import { useCreateCompletion } from "@/hooks/useCreateCompletion";
import { useResources } from "@/hooks/useResources";
import { compile } from "@/lib/parser";
import { cn } from "@/lib/utils";
import {
  DatasetItemType,
  DatasetType,
  createDefaultDatasetItem,
} from "@/types/dataset";
import { PromptTemplateType } from "@/types/prompt";
import { ChevronDownIcon, Play, Plus, Trash2Icon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FC, useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ClickableInput } from "./common/ClickableInput";
import { ClickableTextarea } from "./common/ClickableTextarea";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useToast } from "./ui/use-toast";

type DatasetSectionProps = {
  template: PromptTemplateType;
};

type TableDatasetItemType = {
  promptParameters: Record<string, string>;
  compiledInput: Record<string, string>;
  output: string;
  error: string;
};

export const DatasetSection: FC<DatasetSectionProps> = ({ template }) => {
  const {
    resourceId,
    llmParameters,
    promptTemplate,
    messagesTemplate,
    enabledParameters,
  } = template;
  const { data: resources } = useResources();
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedDatasetId = searchParams.get("datasetId");
  const [dataset, setDataset] = useState<DatasetType>({
    id: uuidv4(),
    name: "Default dataset",
    description: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const { toast } = useToast();
  const [datasetItems, setDatasetItems] = useState<DatasetItemType[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<keyof TableDatasetItemType, boolean>
  >({
    promptParameters: true,
    compiledInput: true,
    output: true,
    error: true,
  });
  const { mutateAsync: createCompletion, isPending } = useCreateCompletion();
  const selectedResource = resources.find((r) => r.id === resourceId);
  const completionType = selectedResource?.completionType;

  const getParsedParameters = useCallback(
    (promptParameters: Record<string, string>) => {
      let params = enabledParameters.reduce((acc, key) => {
        acc[key] = llmParameters[key];
        return acc;
      }, {} as Record<string, any>);
      try {
        const compiledOutput = compile({
          parser: "mustache",
          parameters: promptParameters,
          messagesTemplate:
            completionType === "chat" ? messagesTemplate : undefined,
          promptTemplate:
            completionType === "completion" ? promptTemplate : undefined,
        });
        params = {
          ...params,
          ...compiledOutput,
        };
      } catch (e) {
        if (e instanceof Error) {
          return e.message;
        }
        throw e;
      }
      return params;
    },
    [
      enabledParameters,
      llmParameters,
      messagesTemplate,
      promptTemplate,
      completionType,
    ]
  );

  const handleAddDatasetItem = () => {
    setDatasetItems((items) => [
      ...items,
      createDefaultDatasetItem(dataset.id),
    ]);
  };

  const handleCreateCompletion = async (datasetItemId: string) => {
    const datasetItem = datasetItems.find((item) => item.id === datasetItemId);
    if (datasetItem === undefined) {
      return;
    }
    const parsedParameters = getParsedParameters(datasetItem.promptParameters);
    try {
      const response = await createCompletion({
        resourceId,
        params: parsedParameters,
      });
      setDatasetItems((items) =>
        items.map((item) =>
          item.id === datasetItemId ? { ...item, output: response } : item
        )
      );
    } catch (e) {
      if (e instanceof Error)
        setDatasetItems((items) =>
          items.map((item) =>
            item.id === datasetItemId
              ? { ...item, error: e.message, output: "" }
              : item
          )
        );
    }
  };

  const runAllCompletions = async () => {
    for (const datasetItem of datasetItems) {
      await handleCreateCompletion(datasetItem.id);
    }
  };

  return (
    <div className="flex flex-col w-full h-full space-y-2 overflow-hidden">
      <div className="w-full flex space-x-2 justify-between">
        <ClickableInput
          rootClassName="w-full"
          value={dataset.name}
          placeholder="Input a dataset name..."
          onBlur={(value) => {
            setDataset({
              ...dataset,
              name: value,
            });
          }}
          parse={(value) => value}
        />
        <Button
          onClick={runAllCompletions}
          disabled={datasetItems.length === 0}
          className="space-x-2"
        >
          <Play size={16} />
          <p>Run</p>
        </Button>
      </div>
      <Card className="flex flex-col overflow-hidden h-full">
        <CardHeader className="h-auto p-2 border-b">
          <div className="flex justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className="space-x-2"
                onClick={handleAddDatasetItem}
              >
                <Plus size={16} />
                <p>Add item</p>
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(columnVisibility).map(([column, value]) => (
                  <DropdownMenuCheckboxItem
                    key={column}
                    className="capitalize"
                    checked={value}
                    onCheckedChange={(value) => {
                      setColumnVisibility((prev) => ({
                        ...prev,
                        [column]: value,
                      }));
                    }}
                  >
                    {column}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col overflow-hidden h-full p-0">
          <Table className="w-full h-full flex-shrink-0 overflow-auto">
            <TableHeader className="border-b">
              <TableRow>
                {columnVisibility.promptParameters === true && (
                  <TableHead className="min-w-96">Parameters</TableHead>
                )}
                {columnVisibility.compiledInput === true && (
                  <TableHead className="min-w-96">Compiled Input</TableHead>
                )}
                {columnVisibility.output === true && (
                  <TableHead className="min-w-96">Output</TableHead>
                )}
                {columnVisibility.error === true && (
                  <TableHead className="min-w-96">Error</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="w-full h-full overflow-auto">
              {datasetItems.map((datasetItem) => (
                <ContextMenu key={datasetItem.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow>
                      {columnVisibility.promptParameters === true && (
                        <TableCell
                          className={cn(
                            "align-baseline",
                            "min-w-96",
                            "flex-shrink-0",
                            "whitespace-pre-wrap"
                          )}
                        >
                          <ClickableTextarea
                            rootClassName="h-full"
                            textAreaProps={{
                              className: cn(
                                "h-full",
                                "min-h-full",
                                "align-baseline"
                              ),
                              minRows: -1,
                            }}
                            buttonClassName={[
                              "h-full",
                              "min-h-full",
                              "align-baseline",
                              "flex",
                              "items-start",
                            ]}
                            value={JSON.stringify(
                              datasetItem.promptParameters,
                              null,
                              2
                            )}
                            parse={(value) => {
                              JSON.parse(value);
                              return value;
                            }}
                            onBlur={(value) => {
                              try {
                                setDatasetItems((items) =>
                                  items.map((item) =>
                                    item.id === datasetItem.id
                                      ? {
                                          ...item,
                                          promptParameters: JSON.parse(value),
                                        }
                                      : item
                                  )
                                );
                              } catch (e) {
                                if (e instanceof Error) {
                                  toast({
                                    title: "Error",
                                    description: e.message,
                                    variant: "destructive",
                                  });
                                }
                              }
                            }}
                          />
                        </TableCell>
                      )}
                      {columnVisibility.compiledInput === true && (
                        <TableCell
                          className={cn(
                            "align-baseline",
                            "min-w-96",
                            "flex-shrink-0",
                            "whitespace-pre-wrap"
                          )}
                        >
                          {JSON.stringify(
                            getParsedParameters(datasetItem.promptParameters),
                            null,
                            2
                          )}
                        </TableCell>
                      )}
                      {columnVisibility.output === true && (
                        <TableCell
                          className={cn(
                            "align-baseline",
                            "min-w-96",
                            "flex-shrink-0",
                            "whitespace-pre-wrap"
                          )}
                        >
                          {datasetItem.output}
                        </TableCell>
                      )}
                      {columnVisibility.error === true && (
                        <TableCell
                          className={cn(
                            "align-baseline",
                            "min-w-96",
                            "flex-shrink-0",
                            "whitespace-pre-wrap"
                          )}
                        >
                          {datasetItem.error}
                        </TableCell>
                      )}
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => handleCreateCompletion(datasetItem.id)}
                      disabled={isPending}
                      className="space-x-2"
                    >
                      <Play size={16} />
                      <p>Run</p>
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() =>
                        setDatasetItems((items) =>
                          items.filter((item) => item.id !== datasetItem.id)
                        )
                      }
                      className="space-x-2 text-red-500"
                    >
                      <Trash2Icon size={16} />
                      <p>Delete</p>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="bg-background w-full border-t flex items-center p-2">
          <p className="text-sm text-muted-foreground">
            {datasetItems.length} items
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
