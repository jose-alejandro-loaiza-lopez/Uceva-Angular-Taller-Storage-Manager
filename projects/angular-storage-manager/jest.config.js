const baseConfig = require('../../jest.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'angular-storage-manager',
  name: 'angular-storage-manager',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/../../setup-jest.ts'],
  testPathIgnorePatterns: ['<rootDir>/../../node_modules/', '<rootDir>/../../dist/'],
  collectCoverageFrom: ['src/lib/**/*.ts', '!src/lib/**/*.spec.ts'],
};
