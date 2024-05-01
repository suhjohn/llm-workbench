"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex",
      "items-center",
      "justify-center",
      "rounded-md",
      "bg-gray-100",
      "p-0.5",
      "text-gray-500",
      "dark:bg-gray-800",
      "dark:text-gray-400",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex",
      "items-center",
      "justify-center",
      "whitespace-nowrap",
      "rounded-sm",
      "px-3",
      "py-1.5",
      "text-xs",
      "font-medium",
      "transition-all",
      "focus-visible:outline-none",
      "focus-visible:ring-1",
      "focus-visible:ring-offset-2",
      "disabled:pointer-events-none",
      "disabled:opacity-50",
      "data-[state=active]:bg-white",
      "data-[state=active]:text-gray-950",
      "data-[state=active]:shadow-sm",
      "dark:data-[state=active]:bg-gray-950",
      "dark:data-[state=active]:text-gray-50",
      "focus-visible:ring-offset-blue-500",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2",
      "rounded-md",
      "focus-visible:outline-none",
      "focus-visible:ring-1",
      "focus-visible:ring-offset-2",
      "focus-visible:ring-offset-blue-500",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
