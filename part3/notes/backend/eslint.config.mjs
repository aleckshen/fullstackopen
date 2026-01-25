import globals from "globals"
import js from "@eslint/js"
import stylisticJs from "@stylistic/eslint-plugin"
import { defineConfig } from "eslint/config"

export default defineConfig([
    {
        ignores: ["dist/**"],
    },

    js.configs.recommended,

    {
        files: ["**/*.{js,mjs,cjs}"],
        languageOptions: {
            ecmaVersion: "latest",
            globals: globals.node,
        },
        plugins: {
            "@stylistic/js": stylisticJs,
        },
        rules: {
            "@stylistic/js/indent": ["error", 2],
            "@stylistic/js/linebreak-style": ["error", "unix"],
            "@stylistic/js/quotes": ["error", "single"],
            "@stylistic/js/semi": ["error", "never"],
            eqeqeq: "error",
            "no-trailing-spaces": "error",
            "object-curly-spacing": ["error", "always"],
            "arrow-spacing": ["error", { before: true, after: true }],
            "no-console": "off",
        },
    },
])
