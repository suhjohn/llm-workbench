import { CookieContext } from "@/app/CookieProvider";
import { useContext } from "react";
import { z } from "zod";

// Hook to use the Cookie context
export const useCookieContext = () => {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error("useCookieContext must be used within a CookieProvider");
  }
  return context;
};

const CookieConfigSchema = z.object({
  indexHorizontalDividerWidth: z.coerce.number().optional(),
  indexTemplateOpenAccordion: z.array(z.string()).optional(),
});

type CookieConfig = z.infer<typeof CookieConfigSchema>;

export const useCookieConfigContext = () => {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error(
      "useCookieConfigContext must be used within a CookieConfigProvider"
    );
  }
  const rawConfig = context.cookies.config
    ? JSON.parse(context.cookies.config)
    : {};
  const config = CookieConfigSchema.parse(rawConfig);
  const setConfig = (key: keyof CookieConfig, value: any) => {
    const currentConfig = context.cookies.config
      ? JSON.parse(context.cookies.config)
      : {};
    context.setNewCookie(
      "config",
      JSON.stringify({ ...currentConfig, [key]: value })
    );
  };
  return {
    config,
    setConfig,
  };
};
