import { useCreateCompletion } from "@/hooks/useCreateCompletion";
import { useCreateDatasetRun, useDatasetRuns } from "@/hooks/useDatasetRuns";
import { useDatasetObjById } from "@/hooks/useDatasets";
import { useGetVariablesCallback } from "@/hooks/useGetVariables";
import { useIndexSearchParams } from "@/hooks/useIndexSearchParams";
import { useResources } from "@/hooks/useResources";
import {
  useCreateTemplateDataset,
  useDatasetTemplates,
} from "@/hooks/useTemplates";
import { compile } from "@/lib/parser";
import { cn, getNestedValue } from "@/lib/utils";
import { DatasetType, OutputFieldType } from "@/types/dataset";
import { JsonValue } from "@/types/json";
import { PromptTemplateType } from "@/types/prompt";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, Loader2, Play, Plus, Trash2Icon } from "lucide-react";
import { FC, useCallback, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { IndexDatasetTemplateRunDialog } from "./IndexDatasetTemplateRunDialog";
import { AddColumnDialogContent } from "./common/AddColumnDialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
  onClickTemplate: (templateId: string) => void;
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
  onClickTemplate,
  onClickBack,
}) => {
  const { templateView } = useIndexSearchParams();
  const {
    datasetObj,
    addColumns,
    removeColumns,
    updateOutputField,
    createRow,
    updateRow,
    deleteRow,
  } = useDatasetObjById({
    datasetId: dataset.id,
  });
  const { data: datasetTemplates } = useDatasetTemplates(dataset.id);
  const { mutateAsync: createDatasetRun } = useCreateDatasetRun();
  const { data: datasetRunMap } = useDatasetRuns({
    datasetId: dataset.id,
    templateId: template.id,
  });
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
  const { toast } = useToast();
  const { data: resources } = useResources();
  const [openAddColumnDialog, setOpenAddColumnDialog] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<keyof TableDatasetItemType, boolean>
  >({
    compiledInput: false,
    output: true,
    error: true,
  });
  const [completionLoaderMap, setCompletionLoaderMap] = useState<{
    [key: string]: boolean;
  }>({});
  const { mutateAsync: createCompletion, isPending } = useCreateCompletion();
  const { mutateAsync: createTemplateDataset } = useCreateTemplateDataset();

  const selectedResource = resources.find((r) => r.id === resourceId);
  const completionType = selectedResource?.completionType;

  const getDatasetItemOutput = ({
    outputField,
    datasetRowId,
  }: {
    outputField: OutputFieldType;
    datasetRowId: string;
  }) => {
    const latestRun = datasetRunMap?.[datasetRowId];
    if (latestRun === undefined) {
      return "";
    }
    if (latestRun.output === undefined || latestRun.output === "") {
      return "";
    }
    let res: JsonValue;
    if (outputField.path === "") {
      res = latestRun.output;
    } else {
      res = getNestedValue(latestRun.output, outputField.path.split(",")) ?? "";
    }
    if (res === undefined) {
      return JSON.stringify(latestRun.output, null, 2);
    }
    if (typeof res === "object") {
      return JSON.stringify(res, null, 2);
    }
    return res;
  };

  const getDatasetItemError = (datasetRowId: string) => {
    const latestRun = datasetRunMap?.[datasetRowId];
    if (latestRun === undefined) {
      return "";
    }
    if (latestRun.error === undefined || latestRun.error === "") {
      return "";
    }
    if (latestRun.output === undefined) {
      return "There was an error running the completion.";
    }
    return latestRun?.error;
  };

  const getParsedArguments = useCallback(
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

  const handleCreateCompletion = async (index: number) => {
    const datasetItem = datasetObj.data[index];
    if (!datasetItem) {
      return;
    }
    setCompletionLoaderMap((prev) => ({
      ...prev,
      [datasetItem.id]: true,
    }));
    const parsedParameters = getParsedArguments(datasetItem.arguments);
    try {
      const response = await createCompletion({
        resourceId,
        params: parsedParameters,
      });
      await createDatasetRun({
        id: uuidv4(),
        templateId: template.id,
        datasetId: dataset.id,
        datasetRowId: datasetItem.id,
        output: response,
        error: "",
      });
    } catch (e) {
      if (e instanceof Error) {
        await createDatasetRun({
          id: uuidv4(),
          templateId: template.id,
          datasetId: dataset.id,
          datasetRowId: datasetItem.id,
          output: "",
          error: e.message,
        });
      }
    } finally {
      setCompletionLoaderMap((prev) => ({
        ...prev,
        [datasetItem.id]: false,
      }));
    }
  };

  const { mutateAsync: runAllCompletions, isPending: isRunningAllCompletions } =
    useMutation({
      mutationFn: async () => {
        for (let i = 0; i < datasetObj.data.length; i++) {
          await handleCreateCompletion(i);
        }
      },
    });

  const handleAddColumns = ({ columns }: { columns: string[] }) => {
    const diff = columns.filter(
      (column) => !datasetObj.parameterFields.includes(column)
    );
    addColumns(columns);
    toast({
      title: `Added column${diff.length > 1 ? "s" : ""}`,
      description: `Added ${JSON.stringify(diff)} successfully.`,
    });
  };
  const handleConnectTemplate = async () => {
    await createTemplateDataset({
      datasetId: dataset.id,
      templateId: template.id,
    });
    toast({
      title: `Connected template`,
      description: `Added '${dataset.name}' to connected datasets for '${template.name}' successfully.`,
    });
  };
  const handleRemoveColumns = ({ columns }: { columns: string[] }) => {
    removeColumns(columns);
    toast({
      title: `Removed column${columns.length > 1 ? "s" : ""}`,
      description: `Removed ${JSON.stringify(columns)} successfully.`,
    });
  };

  const handleUpdateRow = async (
    index: number,
    updatedData: Record<string, string>
  ) => {
    try {
      await updateRow(index, updatedData);
    } catch (e) {
      if (e instanceof Error) {
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
      }
    }
  };

  const newPromptParametersExists = templatePromptParameters.some(
    (param) => !datasetObj.parameterFields.includes(param)
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
        <div className="flex space-x-2">
          {templateView === "detail" &&
            !datasetTemplates?.some(
              (datasetTemplate) => datasetTemplate.template.id === template.id
            ) && (
              <Button variant={"outline"} onClick={handleConnectTemplate}>
                <p>Connect template</p>
              </Button>
            )}
          <Button
            onClick={() => runAllCompletions()}
            disabled={datasetObj.data.length === 0 || isRunningAllCompletions}
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
      </div>
      <Card className="flex flex-col overflow-hidden h-full">
        <CardHeader className="h-auto p-2 border-b">
          <div className="flex-col md:flex-row gap-2 flex justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="w-full md:w-auto space-x-2"
                onClick={createRow}
              >
                <Plus size={16} />
                <p>Add row</p>
              </Button>
              {newPromptParametersExists && (
                <Button
                  variant="outline"
                  className="space-x-2"
                  onClick={() =>
                    handleAddColumns({ columns: templatePromptParameters })
                  }
                >
                  <p>Sync arguments</p>
                </Button>
              )}
            </div>
            <Select
              value={template.id}
              onValueChange={(value) => {
                onClickTemplate(value);
              }}
            >
              <SelectTrigger className="w-full md:w-auto md:max-w-96">
                <SelectValue placeholder="Select a connected template">
                  {datasetTemplates?.find(
                    (datasetTemplate) =>
                      datasetTemplate.template.id === template.id
                  )?.template.name ?? "Select a connected template"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-full md:w-auto md:max-w-96">
                {datasetTemplates?.map((datasetTemplate) => (
                  <SelectItem
                    key={datasetTemplate.template.id}
                    value={datasetTemplate.template.id}
                    className="whitespace-pre-wrap"
                  >
                    {datasetTemplate.template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col overflow-hidden h-full p-0">
          <Table className="w-full h-full flex-shrink-0 overflow-auto">
            <TableHeader className={cn("border-b")}>
              <TableRow>
                <TableHead className="w-20 min-w-20 flex-shrink-0">
                  <p className="text-sm text-muted-foreground">#</p>
                </TableHead>
                {datasetObj.parameterFields.map((param) => (
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
                              "text-blue-500",
                            ]
                          )}
                        >
                          {param}
                        </p>
                      </TableHead>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => setOpenAddColumnDialog(true)}
                        disabled={isPending}
                        className="space-x-2"
                      >
                        <p>Add column</p>
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() =>
                          handleRemoveColumns({ columns: [param] })
                        }
                        disabled={isPending}
                        className="space-x-2 text-red-500 hover:text-red-500 focus:text-red-500 dark:focus:text-red-500 dark:hover:text-red-500"
                      >
                        <p>Delete column</p>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
                {templateView === "detail" && (
                  <>
                    {/* Vertical divider */}
                    {datasetObj.parameterFields.length > 0 && (
                      <TableHead className="border-x border-gray-500 dark:border-gray-400 px-0.5"></TableHead>
                    )}
                    {columnVisibility.compiledInput === true && (
                      <TableHead className="min-w-96">Compiled Input</TableHead>
                    )}
                    {datasetObj.outputFields.map(
                      (outputField, outputFieldIndex) => (
                        <TableHead
                          key={outputField.name}
                          className="flex items-center space-x-2 min-w-96"
                        >
                          <p>{outputField.name}</p>
                          <ArrayInput
                            value={outputField.path}
                            onChange={(value) => {
                              updateOutputField(outputFieldIndex, {
                                ...outputField,
                                path: value,
                              });
                            }}
                          />
                        </TableHead>
                      )
                    )}
                    {columnVisibility.error === true && (
                      <TableHead className="min-w-96">error</TableHead>
                    )}
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="w-full h-full overflow-auto">
              {datasetObj.data.map((row, index) => (
                <ContextMenu key={index}>
                  <ContextMenuTrigger
                    asChild
                    className={cn(
                      "hover:bg-accent",
                      "data-[state=open]:bg-accent"
                    )}
                  >
                    <TableRow>
                      <TableCell
                        className={cn(
                          "max-w-20",
                          "text-sm",
                          "text-muted-foreground",
                          "dark:text-muted-foreground"
                        )}
                      >
                        {index + 1}
                      </TableCell>
                      {datasetObj.parameterFields.map((promptParameter) => (
                        <TableCell
                          key={promptParameter}
                          className={cn(
                            "p-0.5",
                            "h-auto",
                            "max-w-96",
                            "whitespace-pre-wrap"
                          )}
                        >
                          <ClickableTextarea
                            rootClassName={cn(
                              "max-w-96",
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
                            value={row.arguments[promptParameter] ?? ""}
                            onBlur={(value) => {
                              handleUpdateRow(index, {
                                ...row.arguments,
                                [promptParameter]: value,
                              });
                            }}
                          />
                        </TableCell>
                      ))}
                      {templateView === "detail" && (
                        <>
                          {/* Vertical divider */}
                          {datasetObj.parameterFields.length > 0 && (
                            <TableCell className="border-x border-gray-500 dark:border-gray-400 px-0.5"></TableCell>
                          )}
                          {columnVisibility.compiledInput === true && (
                            <TableCell
                              className={cn(
                                "p-2",
                                "align-baseline",
                                "max-w-96",
                                "flex-shrink-0",
                                "whitespace-pre-wrap"
                              )}
                            >
                              <p
                                className={cn(["overflow-y-auto", "max-h-64"])}
                              >
                                {JSON.stringify(
                                  getParsedArguments(row.arguments),
                                  null,
                                  2
                                )}
                              </p>
                            </TableCell>
                          )}
                          {datasetObj.outputFields.map((outputField) => (
                            <TableCell
                              key={outputField.name}
                              className={cn(
                                "p-2",
                                "align-baseline",
                                "max-w-96",
                                "flex-shrink-0",
                                "whitespace-pre-wrap"
                              )}
                            >
                              {completionLoaderMap?.[row.id] ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <>
                                  <p
                                    className={cn([
                                      "overflow-y-auto",
                                      "max-h-40",
                                      "whitespace-pre-wrap",
                                      (datasetRunMap?.[row.id] === undefined ||
                                        datasetRunMap?.[row.id].output ===
                                          "") && [
                                        "text-muted-foreground",
                                        "italic",
                                      ],
                                    ])}
                                  >
                                    {getDatasetItemOutput({
                                      outputField,
                                      datasetRowId: row.id,
                                    })}
                                  </p>
                                  <div className="flex justify-end">
                                    <IndexDatasetTemplateRunDialog
                                      datasetId={dataset.id}
                                      templateId={template.id}
                                      datasetRowId={row.id}
                                    />
                                  </div>
                                </>
                              )}
                            </TableCell>
                          ))}
                          {columnVisibility.error === true && (
                            <TableCell
                              className={cn(
                                "p-2",
                                "align-baseline",
                                "max-w-96",
                                "flex-shrink-0",
                                "whitespace-pre-wrap",
                                getDatasetItemError(row.id) === "" &&
                                  completionLoaderMap?.[row.id] !== true && [
                                    "text-muted-foreground",
                                    "italic",
                                  ]
                              )}
                            >
                              {completionLoaderMap?.[row.id] ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : getDatasetItemError(row.id) === "" ? (
                                <p>No error.</p>
                              ) : (
                                <p>{getDatasetItemError(row.id)}</p>
                              )}
                            </TableCell>
                          )}
                        </>
                      )}
                    </TableRow>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => handleCreateCompletion(index)}
                      disabled={isPending}
                      className="space-x-2"
                    >
                      <Play size={16} />
                      <p>Run</p>
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => deleteRow(index)}
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
            {datasetObj.data.length} items
          </p>
        </CardFooter>
      </Card>
      <AddColumnDialogContent
        open={openAddColumnDialog}
        setOpen={setOpenAddColumnDialog}
        onSubmit={(column) => {
          handleAddColumns({ columns: [column] });
        }}
      />
    </div>
  );
};
