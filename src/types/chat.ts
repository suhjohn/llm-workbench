export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
