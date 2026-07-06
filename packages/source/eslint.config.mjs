import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ["jest.config.js", "node_modules/", "vitest.*.ts", "dist/"],
    },
    ...compat.config({
        extends: [
            "eslint:recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:import/recommended",
            "plugin:import/typescript",
            "plugin:react-hooks/recommended",
        ],
        plugins: ["react", "@typescript-eslint", "import"],
        parser: "@typescript-eslint/parser",
        parserOptions: {
            project: ["./tsconfig.json"],
            tsconfigRootDir: __dirname,
        },
        rules: {
            "no-console": "warn",
            "guard-for-in": "error",
            "no-empty": "error",
            "no-shadow": "off",
            "import/no-cycle": "off",
            "import/namespace": "off",
            "import/named": "off",
            "import/no-unresolved": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/no-shadow": "error",
            "@typescript-eslint/no-misused-promises": [
                "error",
                {
                    checksVoidReturn: false,
                },
            ],
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "react/display-name": "off",
            "react-hooks/immutability": "off",
            "react-hooks/refs": "off",
            "react-hooks/set-state-in-effect": "off",
        },
        overrides: [
            {
                files: ["*.ts"],
                rules: {
                    "@typescript-eslint/strict-boolean-expressions": "error",
                },
            },
        ],
    }),
];
