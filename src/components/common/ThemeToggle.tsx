"use client";

import { Moon, Settings, Sun } from "lucide-react";
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
  if (!isMounted) {
    return null;
  }

  return (
    <Select
      value={isMounted ? theme : "system"}
      defaultValue="system"
      onValueChange={(value) => {
        setTheme(value);
      }}
    >
      <SelectTrigger className="w-auto">
        <SelectValue>
          {options.find((option) => option.value === theme)?.icon}
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
