"use client";

import { Loader2, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const options = [
    {
      value: "light",
      icon: <Sun size={16} />,
    },
    {
      value: "dark",
      icon: <Moon size={16} />,
    },
    {
      value: "system",
      icon: <Settings size={16} />,
    },
  ];
  const currentTheme = isMounted ? theme : "system";

  return (
    <Select
      value={currentTheme}
      defaultValue="system"
      onValueChange={(value) => {
        setTheme(value);
      }}
    >
      <SelectTrigger className="w-auto">
        <SelectValue>
          {!isMounted && <Loader2 size={16} className="animate-spin" />}
          {isMounted &&
            options.find((option) => option.value === currentTheme)?.icon}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((themeOption) => (
          <SelectItem key={themeOption.value} value={themeOption.value}>
            <div className="flex space-x-2 items-center">
              {themeOption.icon}
              <p>{themeOption.value}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
