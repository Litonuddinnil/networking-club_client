import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn — shadcn-style class merger.
 * Combines clsx (conditional classes) with tailwind-merge (later utilities win).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
