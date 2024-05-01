import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { FC, useState } from "react";
import { Input, InputProps } from "../ui/input";

type PasswordInputProps = InputProps & {
  rootClassName?: string;
};

export const PasswordInput: FC<PasswordInputProps> = ({
  rootClassName,
  className,
  ...rest
}) => {
  const [show, setShow] = useState(false);
  const type = show ? "text" : "password";
  return (
    <div className={cn("relative", rootClassName)}>
      <Input type={type} className={cn("pr-8", className)} {...rest} />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-0 top-0 transform translate-y-1/2 px-2"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};
