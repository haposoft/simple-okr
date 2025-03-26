// Import jest-dom additions for additional matchers
import '@testing-library/jest-dom';

// Add Request and Response polyfills for testing environment
const { Request, Response } = require('node-fetch');
global.Request = Request;
global.Response = Response;

// Mock the next/router module
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock next-auth
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  return {
    __esModule: true,
    ...originalModule,
    signIn: jest.fn(),
    signOut: jest.fn(),
    useSession: jest.fn(() => {
      return { data: null, status: 'unauthenticated' };
    }),
  };
});

// Add custom matchers
expect.extend({
  toHaveClass(received, ...expected) {
    const pass = expected.every(className => received.classList.contains(className));
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to have class ${expected.join(' ')}`,
      pass,
    };
  },
}); 