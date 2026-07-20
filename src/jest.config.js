const createJestConfig = require("next/jest").default;

const createJestConfigFn = createJestConfig({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

module.exports = createJestConfigFn(config);
