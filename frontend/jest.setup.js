import '@testing-library/jest-dom'
import 'jest-extended'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => {
  return function dynamic(fn) {
    const Component = fn()
    Component.preload = jest.fn()
    return Component
  }
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock fetch
global.fetch = jest.fn()

// Mock WebSocket
global.WebSocket = class WebSocket {
  constructor() {
    this.readyState = 1 // OPEN
    this.send = jest.fn()
    this.close = jest.fn()
    this.addEventListener = jest.fn()
    this.removeEventListener = jest.fn()
  }
}

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api/v1'