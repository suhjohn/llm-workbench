import { useRouter, useSearchParams } from "next/navigation";

export const useNavigateToNewParams = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToNewParams = (params: object) => {
    const newSearchParams = new URLSearchParams(searchParams);

    // Update the search parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });

    // Push updated URL with new search params
    router.push(`/?${newSearchParams.toString()}`);
  };

  return { navigateToNewParams };
};
