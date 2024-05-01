import React from "react";

export interface ThemeLoaderProps
  extends React.ComponentPropsWithoutRef<"script"> {
  forceTheme?: boolean;
  defaultTheme?: string;
  localStorageKey?: string;
}

export const getScript = ({
  forceTheme,
  defaultTheme,
  localStorageKey = "theme",
}: Pick<
  ThemeLoaderProps,
  "defaultTheme" | "forceTheme" | "localStorageKey"
>) => {
  return forceTheme
    ? `document.documentElement.setAttribute("data-theme", '${defaultTheme}');`
    : `
    try {
      const stored = window.localStorage.getItem("${localStorageKey}");
      let theme = a === "light" || a ==="dark" || a === "auto" ? a : "${defaultTheme}";
      if (theme === "auto") {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      document.documentElement.setAttribute("data-theme", theme);
    } catch(t) {}`;
};

const ThemeLoader: React.FC<ThemeLoaderProps> = ({
  forceTheme,
  defaultTheme = "system",
  localStorageKey,
}) => {
  const _defaultTheme = ["dark", "light", "system"].includes(defaultTheme)
    ? defaultTheme
    : "system";
  return (
    <script
      id="theme-loader-script"
      dangerouslySetInnerHTML={{
        __html: getScript({
          forceTheme,
          defaultTheme: _defaultTheme,
          localStorageKey,
        }),
      }}
    />
  );
};

export default ThemeLoader;
