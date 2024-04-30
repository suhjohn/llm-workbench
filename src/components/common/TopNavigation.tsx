import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export const TopNavigation = () => {
  return (
    <header>
      <div
        className={cn(
          "flex w-full",
          "space-x-2",
          "border-b",
          "border-b-gray-200",
          "dark:border-b-gray-800",
          "justify-between",
          'p-4',
        )}
      >
        <div className={cn("font-bold")}>
          <a href="/">PromptPlayground</a>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};
