// ***********************************************************
// This example support/e2e.ts is processed and loaded automatically
// before your test files. This is a great place to put global
// configuration and behavior that modifies Cypress.
// ***********************************************************

import './commands'

// Register cypress-grep plugin for test tagging
import '@cypress/grep'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global test setup
beforeEach(() => {
  // Intercept API calls for better test stability
  cy.intercept('GET', '/health').as('healthCheck')
  cy.intercept('POST', '/login').as('loginRequest')
  cy.intercept('POST', '/register').as('registerRequest')
  cy.intercept('GET', '/items').as('getItems')
  cy.intercept('POST', '/items').as('createItem')
  cy.intercept('PUT', '/items/*').as('updateItem')
  cy.intercept('DELETE', '/items/*').as('deleteItem')
  cy.intercept('GET', '/inventory').as('getInventory')
  cy.intercept('POST', '/inventory').as('addInventory')
  cy.intercept('PUT', '/inventory/*').as('updateInventory')
  cy.intercept('DELETE', '/inventory/*').as('deleteInventory')
  cy.intercept('GET', '/orders').as('getOrders')
  cy.intercept('POST', '/orders').as('createOrder')
  cy.intercept('PUT', '/orders/*').as('updateOrder')
  cy.intercept('DELETE', '/orders/*').as('deleteOrder')
})

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes('ResizeObserver')) {
    return false
  }
  return true
})

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with credentials
       * @example cy.login('admin', 'password')
       */
      login(username: string, password: string): Chainable<void>
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>
      
      /**
       * Custom command to register a new user
       * @example cy.register('newuser', 'password123', 'password123')
       */
      register(username: string, password: string, confirmPassword: string): Chainable<void>
      
      /**
       * Custom command to wait for API request
       * @example cy.waitForApi('@loginRequest')
       */
      waitForApi(alias: string): Chainable<void>
      
      /**
       * Custom command to create test data
       * @example cy.createTestItem('Test Item', 'Description')
       */
      createTestItem(title: string, description?: string): Chainable<void>
    }
  }
}