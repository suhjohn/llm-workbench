import { ChatMessage } from "@/types/chat";
import Mustache from "mustache";

const getMustacheVariables = (template: string) => {
  return Mustache.parse(template)
    .filter(function (v) {
      return v[0] === "name" || v[0] === "#" || v[0] === "&";
    })
    .map(function (v) {
      return v[1];
    });
};

export const getVariables = (parser: string, template: string) => {
  if (parser === "mustache") {
    return getMustacheVariables(template);
  }
  throw new Error(`Unknown parser: ${parser}`);
};

export const compile = ({
  parser,
  messagesTemplate,
  promptTemplate,
  parameters,
}: {
  parser: string;
  messagesTemplate?: ChatMessage[];
  promptTemplate?: string;
  parameters: Record<string, any>;
}) => {
  if (messagesTemplate !== undefined && promptTemplate !== undefined) {
    throw new Error("Cannot have both messages and completion templates");
  }
  if (messagesTemplate === undefined && promptTemplate === undefined) {
    throw new Error("Must have either messages or completion template");
  }
  if (parser === "mustache") {
    try {
      if (promptTemplate !== undefined) {
        return {
          prompt: Mustache.render(promptTemplate, parameters),
        };
      }
      if (messagesTemplate !== undefined) {
        const messages = messagesTemplate.map((message) => ({
          ...message,
          content: Mustache.render(message.content, parameters),
        }));
        return { messages };
      }
    } catch (e) {
      throw e;
    }
  }
  throw new Error(`Unknown parser: ${parser}`);
};
