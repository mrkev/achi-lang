import { fixupPluginRules } from "@eslint/compat";
import eslint from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  {
    plugins: {
      "react-hooks": fixupPluginRules(reactHooks),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },
      ecmaVersion: "latest",
      sourceType: "script",
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "no-fallthrough": "warn",
      "no-empty-function": "off",
      "no-constant-condition": "off",

      "@typescript-eslint/no-empty-function": [
        "warn",
        {
          allow: ["private-constructors"],
        },
      ],

      "@typescript-eslint/ban-types": "off",
      "no-useless-escape": "off",
      indent: "off",
      quotes: "off",
      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/ban-ts-ignore": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "linebreak-style": ["error", "unix"],
      semi: ["error", "always"],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
  }
);
