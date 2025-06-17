
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function to combine class names
 * @param inputs - Class names to combine
 * @returns Combined class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * A list of animation keyframes for use in the application
 * These will be used with the appropriate CSS classes
 */
export const keyframes = {
  // Scan animation keyframes
  "scan-vertical": {
    "0%": { transform: "translateY(0)" },
    "100%": { transform: "translateY(100%)" }
  },
  "scan-horizontal": {
    "0%": { transform: "translateX(0)" },
    "100%": { transform: "translateX(100%)" }
  }
};

/**
 * Animation classes that can be added to Tailwind's config
 */
export const animations = {
  "scan-vertical": "scan-vertical 2s linear infinite alternate",
  "scan-horizontal": "scan-horizontal 2s linear infinite alternate"
};
