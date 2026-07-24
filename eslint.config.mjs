import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored from the Bklit UI registry (ui.bklit.com) — third-party
    // chart internals, not hand-written against this project's lint rules.
    "components/charts/**",
    "components/shimmering-text.tsx",
    "lib/utils.ts",
  ]),
]);

export default eslintConfig;
