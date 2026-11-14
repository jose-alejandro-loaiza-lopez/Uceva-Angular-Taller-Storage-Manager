module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  coverageReporters: ['html', 'json', 'lcov', 'text', 'clover'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/src/'],
  collectCoverageFrom: [
    'projects/angular-storage-manager/src/lib/**/*.ts',
    '!projects/angular-storage-manager/src/lib/**/*.spec.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  verbose: true,
  testEnvironment: 'jsdom',
  collectCoverage: true,
  clearMocks: true,
  testMatch: ['**/*.spec.ts'],
  rootDir: './',
};
