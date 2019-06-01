// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['js', 'ts'],
  preset: 'ts-jest',
  rootDir: 'src', // acts as if file was inside /src folder
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  verbose: true,
};
