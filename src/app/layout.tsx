import { Inter } from "next/font/google";
import { ReactQueryProvider } from "./ReactQueryProvider";

import { Toaster } from "@/components/ui/toaster";
import { getCookies } from "cookies-next";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import { CookieProvider } from "./CookieProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: "PromptRepo",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const _cookies = cookies();
  const theme = _cookies.get("theme")?.value || "light";
  const cookiesObj = getCookies({
    cookies,
  });
  return (
    <html lang="en" className={theme} suppressHydrationWarning>
      <body className={inter.className}>
        <ReactQueryProvider>
          <ThemeProvider attribute="class">
            <CookieProvider cookies={cookiesObj}>
              <main>{children}</main>
              <Toaster />
            </CookieProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
