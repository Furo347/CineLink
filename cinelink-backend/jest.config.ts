import type { Config } from "jest";

const config: Config = {
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.ts"],
    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
    clearMocks: true,
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: {
                    esModuleInterop: true,
                },
            },
        ],
    },
};

export default config;
