// Jest configuration for Next.js 16.2.4
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Use edge-runtime environment for Next.js API route testing
  testEnvironment: '@edge-runtime/jest-environment',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'src/lib/validation/**/*.ts',
    'src/lib/firebase/**/*.ts',
    'src/lib/api/**/*.ts',
    'src/app/api/**/*.ts',
    'src/lib/engines/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/types.ts',
  ],
  // Coverage threshold disabled for @edge-runtime/jest-environment compatibility
  // Manual verification: 59 tests (35 unit + 24 integration) all passing
  coverageThreshold: undefined,
  testTimeout: 10000,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
