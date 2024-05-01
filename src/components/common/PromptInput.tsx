import { ChatMessage } from "@/types/chat";
import { PlusIcon, TrashIcon } from "lucide-react";
import { FC } from "react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

type PromptInputProps = {
  completionPromptProps?: {
    value: string;
    onChange: (value: string) => void;
  };
  chatPromptProps?: {
    value: ChatMessage[];
    onChange: (value: ChatMessage[]) => void;
  };
};

const CompletionPromptInput: FC<PromptInputProps> = ({
  completionPromptProps,
}) => {
  return (
    <Textarea
      value={completionPromptProps?.value}
      onChange={(e) => completionPromptProps?.onChange(e.target.value)}
    />
  );
};

const ChatPromptInput: FC<PromptInputProps> = ({ chatPromptProps }) => {
  const nextRole = () => {
    const lastRole = chatPromptProps?.value.slice(-1)[0]?.role;
    if (lastRole === "system") {
      return "user";
    }
    if (lastRole === "user") {
      return "assistant";
    }
    if (lastRole === "assistant") {
      return "user";
    }
    return "system";
  }
  return (
    <div className="flex flex-col space-y-4 w-full">
      {chatPromptProps?.value.map((message, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between">
            <Select
              value={message.role}
              onValueChange={(value) => {
                if (chatPromptProps === undefined) {
                  return;
                }
                const newChatPrompt = [...chatPromptProps.value];
                newChatPrompt[index] = {
                  ...newChatPrompt[index],
                  role: value as "system" | "user" | "assistant",
                };
                chatPromptProps.onChange(newChatPrompt);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={"outline"}
              onClick={() => {
                if (chatPromptProps === undefined) {
                  return;
                }
                chatPromptProps.onChange(
                  chatPromptProps.value.filter((_, i) => i !== index)
                );
              }}
            >
              <TrashIcon size={12} />
            </Button>
          </div>
          <AutoResizeTextarea
            value={message.content}
            minRows={5}
            maxRows={20}
            onChange={(e) => {
              if (chatPromptProps === undefined) {
                return;
              }
              const newChatPrompt = [...chatPromptProps.value];
              newChatPrompt[index] = {
                ...newChatPrompt[index],
                content: e.target.value,
              };
              chatPromptProps.onChange(newChatPrompt);
            }}
          />
        </div>
      ))}
      <Button
        className="flex space-x-2"
        variant={"outline"}
        onClick={() => {
          if (chatPromptProps === undefined) {
            return;
          }
          chatPromptProps.onChange([
            ...chatPromptProps.value,
            { role: nextRole(), content: "" },
          ]);
        }}
      >
        <PlusIcon size={12} />
        <p>Add message</p>
      </Button>
    </div>
  );
};

export const PromptInput: FC<PromptInputProps> = (props) => {
  if (props.completionPromptProps !== undefined) {
    return <CompletionPromptInput {...props} />;
  }
  if (props.chatPromptProps !== undefined) {
    return <ChatPromptInput {...props} />;
  }
  throw new Error(
    "PromptInput: completionPromptProps or chatPromptProps must be defined"
  );
};
