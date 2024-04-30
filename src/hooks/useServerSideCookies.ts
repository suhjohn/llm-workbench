import { createContext, useContext } from 'react';

interface CookieContextType {
  cookies: { [key: string]: any };
}

const CookieContext = createContext<CookieContextType | null>(null);

export function useCookies() {
  return useContext(CookieContext);
}

export default CookieContext;
