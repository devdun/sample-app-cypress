import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // Setup cypress-grep plugin for test tagging
      require('@cypress/grep/src/plugin')(config)
      return config
    },
    env: {
      apiUrl: 'http://localhost:5000',
      // Test user credentials
      adminUsername: 'admin',
      adminPassword: 'password',
      regularUsername: 'user1',
      regularPassword: 'user123',
      // Test filtering
      grepFilterSpecs: true,
      grepOmitFiltered: true
    }
  }
})
