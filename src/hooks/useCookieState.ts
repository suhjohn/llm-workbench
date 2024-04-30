import { useQuery } from '@tanstack/react-query';
import { getCookie, setCookie } from 'cookies-next';

export const useCookieState = <T>(key: string): [T | null, (newValue: T) => void] => {
  const query = useQuery({
    queryKey: ["cookieState", key],
    queryFn: () => {
      return getCookie(key) ?? 'null' as T | null;
    },
  });

  return [
    (query.data ?? null) as T | null,
    (newValue: T) => {
      setCookie(key, newValue);
      void query.refetch();
    },
  ]
};
