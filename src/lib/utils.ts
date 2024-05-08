import { JsonValue } from "@/types/json";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNestedValue<
  T extends JsonValue,
  Path extends (string | number)[]
>(json: T, path: Path): JsonValue | undefined {
  let current: JsonValue | undefined = json;

  // eslint-disable-next-line no-restricted-syntax
  for (const key of path) {
    if (
      current !== undefined &&
      current !== null &&
      typeof current === "object"
    ) {
      current = Array.isArray(current)
        ? current[key as number]
        : current[key as string];
    } else {
      return undefined; // Not an object or array, or path does not exist
    }
  }
  return current;
}
