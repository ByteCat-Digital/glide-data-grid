import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import react from "eslint-plugin-react";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ["jest.config.js", "node_modules/", "build.cjs", "vitest.*.ts", "dist/"],
    },
    {
        plugins: {
            react,
            sonarjs,
            unicorn,
        },
    },
    ...compat.config({
        extends: [
            "eslint:recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:import/recommended",
            "plugin:import/typescript",
            "plugin:react-hooks/recommended",
        ],
        plugins: ["@typescript-eslint", "import"],
        parser: "@typescript-eslint/parser",
        parserOptions: {
            project: ["./tsconfig.json"],
            tsconfigRootDir: __dirname,
        },
        rules: {
            "no-console": "warn",
            "guard-for-in": "error",
            "no-empty": "error",
            "no-useless-assignment": "off",
            eqeqeq: ["error", "always"],
            "no-shadow": "off",
            "import/no-cycle": "off",
            "import/namespace": "off",
            "import/named": "off",
            "import/no-unresolved": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "sonarjs/cognitive-complexity": "off",
            "sonarjs/no-inverted-boolean-check": "error",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/no-shadow": "error",
            "unicorn/no-nested-ternary": "off",
            "unicorn/prevent-abbreviations": "off",
            "unicorn/no-useless-undefined": "off",
            "unicorn/prefer-query-selector": "off",
            "unicorn/filename-case": "off",
            "unicorn/prefer-top-level-await": "off",
            "unicorn/no-array-callback-reference": "off",
            "unicorn/no-null": "off",
            "unicorn/prefer-dom-node-text-content": "off",
            "unicorn/consistent-destructuring": "off",
            "unicorn/no-array-reduce": "off",
            "unicorn/expiring-todo-comments": "off",
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksVoidReturn: false,
                },
            ],
            "@typescript-eslint/strict-boolean-expressions": "error",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "react-hooks/immutability": "off",
            "react-hooks/preserve-manual-memoization": "off",
            "react-hooks/refs": "off",
            "react-hooks/set-state-in-effect": "off",
        },
    }),
];
