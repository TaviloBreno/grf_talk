import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require('@cypress/code-coverage/task')(on, config)
      return config
    },
    
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Test settings
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Retry settings
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    // Video settings
    video: true,
    videoCompression: 32,
    
    // Screenshots
    screenshotOnRunFailure: true,
  },
  
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
  
  env: {
    // Environment variables for tests
    API_URL: 'http://localhost:8000/api/v1',
    FRONTEND_URL: 'http://localhost:3000',
  },
})