const js = require("@eslint/js");
const globals = require("globals");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
    {
        ignores: ["dist/**", "coverage/**"],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    }
);
