import { FC, useState } from "react";
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

type AddColumnDialogContentProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (column: string) => void;
};

export const AddColumnDialogContent: FC<AddColumnDialogContentProps> = ({
  open,
  setOpen,
  onSubmit,
}) => {
  const [column, setColumn] = useState<string>("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <p>Add new column</p>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 w-full">
          <Label>Column name</Label>
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
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
