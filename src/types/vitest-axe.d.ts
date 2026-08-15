import "vitest";
import { AxeResults } from "axe-core";

declare module "vitest" {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

declare module "vitest-axe" {
  export const toHaveNoViolations: {
    (results: AxeResults): { pass: boolean; message: () => string };
  };
  export const axe: typeof import("axe-core").default;
}