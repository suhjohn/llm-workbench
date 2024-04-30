import { Inter } from "next/font/google";
import { ReactQueryProvider } from "./reactQueryProvider";

import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const _cookies = cookies();
  const theme = _cookies.get("theme")?.value || "light";
  return (
    <html lang="en" className={theme} suppressHydrationWarning>
      <body className={inter.className}>
        <ReactQueryProvider>
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
