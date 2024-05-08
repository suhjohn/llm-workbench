import { useCreateCompletion } from "@/hooks/useCreateCompletion";
import { useGetVariablesCallback } from "@/hooks/useGetVariables";
import { useResources } from "@/hooks/useResources";
import { compile } from "@/lib/parser";
import { cn, getNestedValue } from "@/lib/utils";
import {
  DatasetItemType,
  DatasetType,
  createDefaultDatasetItem,
} from "@/types/dataset";
import { JsonValue } from "@/types/json";
import { PromptTemplateType } from "@/types/prompt";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronDownIcon,
  ChevronLeft,
  Loader2,
  Play,
  Plus,
  Trash2Icon,
} from "lucide-react";
import { FC, useCallback, useMemo, useState } from "react";
import { ArrayInput } from "./common/ArrayInput";
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
  dataset: DatasetType;
  setDataset: (dataset: DatasetType) => void;
  datasetItems: DatasetItemType[];
  setDatasetItem: (args: {
    action: "update" | "delete" | "create";
    datasetItem: DatasetItemType;
  }) => void;
  setDatasetItems: (datasetItems: DatasetItemType[]) => void;
  onClickBack?: () => void;
};

type TableDatasetItemType = {
  compiledInput: Record<string, string>;
  output: string;
  error: string;
};

export const DatasetSection: FC<DatasetSectionProps> = ({
  template,
  dataset,
  setDataset,
  datasetItems,
  setDatasetItem,
  setDatasetItems,
  onClickBack,
}) => {
  const getVariablesFromParameters = useGetVariablesCallback();
  const {
    resourceId,
    llmParameters,
    promptTemplate,
    messagesTemplate,
    enabledParameters,
  } = template;
  const templatePromptParameters = useMemo(() => {
    try {
      return getVariablesFromParameters({
        promptTemplate,
        messagesTemplate,
        parser: "mustache",
      });
    } catch (e) {
      return [];
    }
  }, [getVariablesFromParameters, promptTemplate, messagesTemplate]);
  const [outputPath, setOutputPath] = useState<string>("");
  const [outputPathArray, setOutputPathArray] = useState<(string | number)[]>(
    []
  );
  const { toast } = useToast();
  const { data: resources } = useResources();
  const [columnVisibility, setColumnVisibility] = useState<
    Record<keyof TableDatasetItemType, boolean>
  >({
    compiledInput: false,
    output: true,
    error: true,
  });
  const { mutateAsync: createCompletion, isPending } = useCreateCompletion();
  const selectedResource = resources.find((r) => r.id === resourceId);
  const completionType = selectedResource?.completionType;

  const getDatasetItemOutput = (datasetItem: DatasetItemType) => {
    let res: JsonValue | undefined = "No output.";
    if (datasetItem.output === undefined || datasetItem.output === "") {
      return res;
    }
    if (outputPath === "") {
      res = datasetItem.output;
    } else {
      res = getNestedValue(datasetItem.output, outputPathArray);
    }
    if (res === undefined) {
      return JSON.stringify(datasetItem.output, null, 2);
    }
    if (typeof res === "object") {
      return JSON.stringify(res, null, 2);
    }
    return res;
  };

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
    setDatasetItem({
      action: "create",
      datasetItem: createDefaultDatasetItem(dataset.id),
    });
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
      setDatasetItem({
        action: "update",
        datasetItem: {
          ...datasetItem,
          output: response,
          error: "",
        },
      });
    } catch (e) {
      if (e instanceof Error)
        setDatasetItem({
          action: "update",
          datasetItem: {
            ...datasetItem,
            output: "",
            error: e.message,
          },
        });
    }
  };

  const { mutateAsync: runAllCompletions, isPending: isRunningAllCompletions } =
    useMutation({
      mutationFn: async () => {
        for (const datasetItem of datasetItems) {
          await handleCreateCompletion(datasetItem.id);
        }
      },
    });

  const handleAddColumns = ({ columns }: { columns: string[] }) => {
    const diff = columns.filter(
      (column) => !dataset.parameters.includes(column)
    );
    setDataset({
      ...dataset,
      parameters: [...dataset.parameters, ...diff],
    });
    toast({
      title: `Added column${diff.length > 1 ? "s" : ""}`,
      description: `Added ${JSON.stringify(diff)} successfully.`,
    });
  };

  const handleRemoveColumns = ({ columns }: { columns: string[] }) => {
    const diff = dataset.parameters.filter(
      (column) => !columns.includes(column)
    );
    setDataset({
      ...dataset,
      parameters: diff,
    });
    setDatasetItems(
      datasetItems.map((item) => {
        const newPromptParameters = Object.fromEntries(
          Object.entries(item.promptParameters).filter(
            ([key, _]) => !columns.includes(key)
          )
        );
        return {
          ...item,
          promptParameters: newPromptParameters,
        };
      })
    );
    toast({
      title: `Removed column${columns.length > 1 ? "s" : ""}`,
      description: `Removed ${JSON.stringify(columns)} successfully.`,
    });
  };

  const newPromptParametersExists = templatePromptParameters.some(
    (param) => !dataset.parameters.includes(param)
  );
  return (
    <div className="flex flex-col w-full h-full space-y-2 overflow-hidden">
      <div className="w-full flex space-x-2 justify-between">
        <Button
          className="px-2 py-2 h-auto"
          onClick={onClickBack}
          variant={"ghost"}
        >
          <ChevronLeft size={16} />
        </Button>
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
          onClick={() => runAllCompletions()}
          disabled={datasetItems.length === 0 || isRunningAllCompletions}
          className="space-x-2"
        >
          {isRunningAllCompletions && (
            <Loader2 size={16} className="animate-spin" />
          )}
          {!isRunningAllCompletions && (
            <>
              <Play size={16} />
              <p>Run</p>
            </>
          )}
        </Button>
      </div>
      <Card className="flex flex-col overflow-hidden h-full">
        <CardHeader className="h-auto p-2 border-b">
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="space-x-2"
                onClick={handleAddDatasetItem}
              >
                <Plus size={16} />
                <p>Add item</p>
              </Button>
              {newPromptParametersExists && (
                <Button
                  variant="outline"
                  className="space-x-2"
                  onClick={() =>
                    handleAddColumns({ columns: templatePromptParameters })
                  }
                >
                  <p>Sync parameters</p>
                </Button>
              )}
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
            <TableHeader className={cn("border-b")}>
              <TableRow>
                <TableHead />
                {dataset.parameters.map((param) => (
                  <ContextMenu key={param}>
                    <ContextMenuTrigger
                      asChild
                      className={cn(
                        "hover:bg-accent",
                        "data-[state=open]:bg-accent"
                      )}
                    >
                      <TableHead className={cn("min-w-96")}>
                        <p
                          className={cn(
                            templatePromptParameters.includes(param) && [
                              "font-bold",
                              "text-foreground",
                            ]
                          )}
                        >
                          {param}
                        </p>
                      </TableHead>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() =>
                          handleRemoveColumns({ columns: [param] })
                        }
                        disabled={isPending}
                        className="space-x-2 text-red-500"
                      >
                        <Trash2Icon size={16} />
                        <p>Delete column</p>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
                {/* Vertical divider */}
                {dataset.parameters.length > 0 && (
                  <TableHead className="border-x border-gray-500 dark:border-gray-400 px-0.5"></TableHead>
                )}
                {columnVisibility.compiledInput === true && (
                  <TableHead className="min-w-96">Compiled Input</TableHead>
                )}
                {columnVisibility.output === true && (
                  <TableHead className="flex space-x-2 items-center min-w-96">
                    <p>Output</p>
                    <ArrayInput
                      value={outputPath}
                      readOnly={false}
                      onChange={setOutputPath}
                      onArrayChange={setOutputPathArray}
                    />
                  </TableHead>
                )}
                {columnVisibility.error === true && (
                  <TableHead className="min-w-96">Error</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="w-full h-full overflow-auto">
              {datasetItems.map((datasetItem, index) => (
                <ContextMenu key={datasetItem.id}>
                  <ContextMenuTrigger
                    asChild
                    className={cn(
                      "hover:bg-accent",
                      "data-[state=open]:bg-accent"
                    )}
                  >
                    <TableRow>
                      <TableCell>
                        <p
                          className={cn(
                            "text-sm",
                            "text-muted-foreground",
                            "dark:text-muted-foreground"
                          )}
                        >
                          {index + 1}
                        </p>
                      </TableCell>
                      {dataset.parameters.map((promptParameter) => (
                        <TableCell
                          key={promptParameter}
                          className={cn(
                            "p-0.5",
                            "h-auto",
                            "w-96",
                            "flex-shrink-0",
                            "whitespace-pre-wrap"
                          )}
                        >
                          <ClickableTextarea
                            rootClassName={cn(
                              "w-full",
                              "flex",
                              "h-full",
                              "border",
                              "border-transparent",
                              "hover:border-gray-200",
                              "dark:hover:border-gray-700",
                              "rounded-md"
                            )}
                            textAreaProps={{
                              className: cn(
                                "align-baseline",
                                "min-h-full",
                                "h-full",
                                "max-h-64",
                                "whitespace-pre-wrap",
                                "rounded-none",
                                "border-none"
                              ),
                              minRows: -1,
                            }}
                            buttonClassName={[
                              "align-baseline",
                              "items-start",
                              "flex",
                              "h-full",
                              "max-h-64",
                              "break-all",
                              "whitespace-pre-wrap",
                              "overflow-y-auto",
                              "rounded-none",
                              "border-none",
                            ]}
                            placeholder={
                              "Input a value for " + promptParameter + "... "
                            }
                            value={
                              datasetItem.promptParameters[promptParameter] ??
                              ""
                            }
                            onBlur={(value) => {
                              try {
                                setDatasetItem({
                                  action: "update",
                                  datasetItem: {
                                    ...datasetItem,
                                    promptParameters: {
                                      ...datasetItem.promptParameters,
                                      [promptParameter]: value,
                                    },
                                  },
                                });
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
                      ))}
                      {/* Vertical divider */}
                      {dataset.parameters.length > 0 && (
                        <TableCell className="border-x border-gray-500 dark:border-gray-400 px-0.5"></TableCell>
                      )}
                      {columnVisibility.compiledInput === true && (
                        <TableCell
                          className={cn(
                            "p-2",
                            "align-baseline",
                            "min-w-96",
                            "flex-shrink-0",
                            "whitespace-pre-wrap"
                          )}
                        >
                          <p className={cn(["overflow-y-auto", "max-h-64"])}>
                            {JSON.stringify(
                              getParsedParameters(datasetItem.promptParameters),
                              null,
                              2
                            )}
                          </p>
                        </TableCell>
                      )}
                      {columnVisibility.output === true && (
                        <TableCell
                          className={cn(
                            "p-2",
                            "align-baseline",
                            "min-w-96",
                            "flex-shrink-0",
                            "whitespace-pre-wrap"
                          )}
                        >
                          <p
                            className={cn([
                              "overflow-y-auto",
                              "max-h-40",
                              "whitespace-pre-wrap",
                              (datasetItem.output === undefined ||
                                datasetItem.output === "") && [
                                "text-muted-foreground",
                                "italic",
                              ],
                            ])}
                          >
                            {getDatasetItemOutput(datasetItem)}
                          </p>
                        </TableCell>
                      )}
                      {columnVisibility.error === true && (
                        <TableCell
                          className={cn(
                            "p-2",
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
                        setDatasetItem({
                          action: "delete",
                          datasetItem,
                        })
                      }
                      className="space-x-2 text-red-500"
                    >
                      <Trash2Icon size={16} />
                      <p>Delete Row</p>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="bg-background w-full border-t flex items-center px-4 py-2">
          <p className="text-sm text-muted-foreground">
            {datasetItems.length} items
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
