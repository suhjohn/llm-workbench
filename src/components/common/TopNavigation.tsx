import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { IoLogoGithub } from "react-icons/io";
import { Button } from "../ui/button";
import { APIKeysDialog } from "./APIKeysDialog";
import { ThemeToggle } from "./ThemeToggle";

export const TopNavigation = () => {
  return (
    <header className={cn("sticky", "top-0", "bg-background", "z-10")}>
      <div
        className={cn(
          "flex w-full",
          "space-x-2",
          "border-b",
          "border-b-gray-200",
          "dark:border-b-gray-800",
          "justify-between",
          "py-2",
          "px-4",
          "items-center"
        )}
      >
        <div className={cn("font-bold")}>
          <Link href="/" className="flex space-x-2 items-center">
            <p>LLM Workbench</p>
          </Link>
        </div>
        <div className="flex gap-2">
          <Button variant={"ghost"} className="p-0 px-1.5 py-1.5 h-8" asChild>
            <Link
              href={"https://github.com/suhjohn/prompt-playground"}
              target="_blank"
            >
              <IoLogoGithub size={20} />
            </Link>
          </Button>
          <APIKeysDialog />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
