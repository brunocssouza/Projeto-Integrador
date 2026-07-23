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
  ]),
  {
    name: "no-direct-process-env",
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["process.env"],
              message: "Use `env` from @/lib/env instead of process.env directly.",
              allowTypeImports: false,
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
