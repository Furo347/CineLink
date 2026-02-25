import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.ts"],
    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
    clearMocks: true,
    globals: {
        "ts-jest": {
            tsconfig: {
                esModuleInterop: true,
            },
        },
    },
};

export default config;
