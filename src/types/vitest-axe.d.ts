import "vitest";
import type { AxeResults } from "axe-core";

declare module "vitest" {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

declare module "vitest-axe" {
  type MatcherFn = (this: unknown, received: AxeResults, expected?: unknown) => { message: () => string; pass: boolean };
  export const toHaveNoViolations: Record<string, MatcherFn>;
  export const axe: typeof import("axe-core").default;
}