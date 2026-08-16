import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "build/**",
    ".react-router/**",
    ".wrangler/**",
    "node_modules/**",
    "worker-configuration.d.ts",
  ]),
  {
    files: ["**/*.{js,mjs,ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
          allowExportNames: [
            "ErrorBoundary",
            "Layout",
            "card17Demo",
            "card19Demo",
            "headers",
            "links",
            "loader",
            "meta",
            "shouldRevalidate",
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/charts/**/*.{ts,tsx}"],
    // Bklit registry source follows its upstream lint rules.
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["src/lib/shape-context.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
]);
