const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const nextJest = require("next/jest").default;

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  projects: [
    {
      displayName: "unit",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/tests/unit/**/*.test.{ts,tsx}"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      transform: {
        "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }],
      },
    },
    {
      displayName: "integration",
      testEnvironment: "node",
      testMatch: ["<rootDir>/tests/integration/**/*.test.{ts,tsx}"],
      setupFilesAfterEnv: [],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      transform: {
        "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }],
      },
    },
  ],
};

module.exports = createJestConfig(config);
