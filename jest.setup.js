// Jest setup file - runs before each test suite
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'mock-api-key'
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'mock-auth-domain'
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'mock-project-id'
process.env.AWS_ACCESS_KEY_ID = 'mock-aws-key'
process.env.AWS_SECRET_ACCESS_KEY = 'mock-aws-secret'
process.env.GEMINI_API_KEY = 'mock-gemini-key'

// Suppress console warnings during tests (optional)
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}
