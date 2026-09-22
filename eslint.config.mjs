import js from "@eslint/js";
import tseslint from "typescript-eslint";
export default [
  { ignores: [".next/**", "dist/**", "node_modules/**", "scratch/**"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-extra-boolean-cast": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
];
