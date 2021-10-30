module.exports = {
  projects: [
    {
      displayName: 'node',
      preset: 'ts-jest',
      coveragePathIgnorePatterns: ['node_modules', 'exceptions.ts'],
      collectCoverage: true,
      collectCoverageFrom: ['src/**/*.ts'],
      testEnvironment: '<rootDir>/test/jest-node-env.ts',
    },
    {
      displayName: 'browser',
      preset: 'ts-jest',
      collectCoverageFrom: ['src/**/*.ts'],
      testEnvironment: '<rootDir>/test/jest-browser-env.ts',
      collectCoverage: false,
    },
  ],
}
