import { useDatasetRowRuns } from "@/hooks/useDatasetRuns";
import { formatAppleDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";
import { FC } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";

type IndexDatasetTemplateRunDialogProps = {
  datasetId: string;
  templateId: string;
  datasetRowId: string;
};

export const IndexDatasetTemplateRunDialog: FC<
  IndexDatasetTemplateRunDialogProps
> = ({ datasetId, templateId, datasetRowId }) => {
  const { data: runs } = useDatasetRowRuns({
    datasetId,
    templateId,
    datasetRowId,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="space-x-2">
          <History size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 overflow-hidden h-full max-w-screen-lg">
        <DialogHeader className="p-4">
          <DialogTitle>
            <p>Run history</p>
          </DialogTitle>
          <DialogDescription>
            <p>{`${
              runs !== undefined ? Object.values(runs).length : 0
            } runs`}</p>
          </DialogDescription>
        </DialogHeader>
        {runs !== undefined && (
          <div className="px-4 flex flex-1 gap-4 w-full overflow-auto h-full">
            <div className={cn("flex", "flex-col", "items-start", "space-y-2")}>
              {Object.values(runs).map((run) => (
                <Card key={run.id}>
                  <CardHeader>
                    <p className="text-sm text-gray-500">
                      {formatAppleDate(new Date(run.createdAt))}
                    </p>
                    <p>{run.id}</p>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <Label>Output</Label>
                      <pre
                        className={cn("overflow-auto", "whitespace-pre-wrap")}
                      >
                        {JSON.stringify(run.output ?? "", null, 2)}
                      </pre>
                    </div>
                    <div>
                      <Label>Error</Label>
                      <p className={cn("overflow-auto", "whitespace-pre-wrap")}>
                        {run.error !== undefined && run.error !== ""
                          ? run.error
                          : "No error"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
};
