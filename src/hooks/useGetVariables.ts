import { getVariables } from "@/lib/parser";
import { ChatMessage } from "@/types/chat";

export const useGetVariablesCallback = () => {
  const getVariablesFromParameters = ({
    messagesTemplate,
    promptTemplate,
    parser,
  }: {
    messagesTemplate?: ChatMessage[];
    promptTemplate?: string;
    parser: string;
  }) => {
    if (messagesTemplate === undefined && promptTemplate === undefined) {
      throw new Error(
        "Either messagesTemplate or promptTemplate must be defined."
      );
    }

    if (messagesTemplate !== undefined && messagesTemplate !== null) {
      const variables = new Set<string>();
      messagesTemplate?.forEach((message) => {
        getVariables(parser, message.content).forEach((variable) => {
          variables.add(variable);
        });
      });
      return Array.from(variables);
    }
    if (promptTemplate !== undefined && promptTemplate !== null) {
      return getVariables(parser, promptTemplate);
    }
    return [];
  };
  return getVariablesFromParameters;
};
