"use client";

import { setCookie } from "cookies-next";
import { TmpCookiesObj } from "cookies-next/lib/types";
import { ReactNode, createContext, useState } from "react";

interface CookieContextType {
  cookies: TmpCookiesObj;
  setNewCookie: (key: string, value: string) => void;
}

export const CookieContext = createContext<CookieContextType | undefined>(undefined);

export const CookieProvider = ({
  children,
  cookies: initialCookies,
}: {
  children: ReactNode;
  cookies: TmpCookiesObj;
}) => {
  const [cookies, setCookies] = useState<TmpCookiesObj>(initialCookies);

  // Function to set new cookies
  const setNewCookie = (key: string, value: string) => {
    setCookie(key, value);
    setCookies({ ...cookies, [key]: value });
  };

  return (
    <CookieContext.Provider value={{ cookies, setNewCookie }}>
      {children}
    </CookieContext.Provider>
  );
};
