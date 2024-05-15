import { FC, useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type UpdateColumnDialogContentProps = {
  currentColumn: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (column: string) => void;
};

export const UpdateColumnDialogContent: FC<UpdateColumnDialogContentProps> = ({
  currentColumn,
  open,
  setOpen,
  onSubmit,
}) => {
  const [column, setColumn] = useState<string>(currentColumn);
  useEffect(() => {
    setColumn(currentColumn);
  }, [currentColumn]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <p>Rename column</p>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 w-full">
          <Label>New column name</Label>
          <Input
            value={column}
            onChange={(e) => {
              setColumn(e.target.value);
            }}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onSubmit(column);
              setOpen(false);
            }}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
