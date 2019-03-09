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
      tsConfigFile: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  rootDir: 'src', // acts as if file was inside /src folder
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  verbose: true,
};
