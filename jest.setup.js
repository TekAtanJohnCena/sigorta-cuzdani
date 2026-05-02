// Jest setup file - runs before each test suite
import '@testing-library/jest-dom'

// Polyfill for Next.js edge runtime APIs
global.Request = class Request {
  constructor(input, init) {
    this.url = typeof input === 'string' ? input : input.url;
    this.method = init?.method || 'GET';
    this.headers = new Map(Object.entries(init?.headers || {}));
    this._body = init?.body;
  }

  get body() {
    return this._body;
  }

  async json() {
    return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
  }
}

global.Response = class Response {
  constructor(body, init) {
    this._body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.headers = new Map(Object.entries(init?.headers || {}));
  }

  async json() {
    return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
  }
}

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
