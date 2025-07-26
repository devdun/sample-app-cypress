/// <reference types="cypress" />
// ***********************************************
// This file contains custom commands and overwrite
// existing commands.
//
// For comprehensive examples of custom commands
// please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Login command
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/')
  cy.get('[data-cy="username-input"]').type(username)
  cy.get('[data-cy="password-input"]').type(password)
  cy.get('[data-cy="login-button"]').click()
  cy.wait('@loginRequest')
  cy.url().should('not.include', '/login')
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="logout-button"]').click()
  cy.url().should('include', '/')
  cy.get('[data-cy="username-input"]').should('be.visible')
})

// Register command
Cypress.Commands.add('register', (username: string, password: string, confirmPassword: string) => {
  cy.visit('/')
  cy.get('[data-cy="switch-to-register-button"]').click()
  cy.get('[data-cy="register-username-input"]').type(username)
  cy.get('[data-cy="register-password-input"]').type(password)
  cy.get('[data-cy="register-confirm-password-input"]').type(confirmPassword)
  cy.get('[data-cy="register-button"]').click()
  cy.wait('@registerRequest')
})

// Wait for API command
Cypress.Commands.add('waitForApi', (alias: string) => {
  cy.wait(alias).then((interception) => {
    expect(interception.response?.statusCode).to.be.oneOf([200, 201, 204])
  })
})

// Create test item command
Cypress.Commands.add('createTestItem', (title: string, description?: string) => {
  cy.get('[data-cy="items-tab"]').click()
  cy.get('[data-cy="new-item-title"]').type(title)
  if (description) {
    cy.get('[data-cy="new-item-description"]').type(description)
  }
  cy.get('[data-cy="add-item-button"]').click()
  cy.wait('@createItem')
  cy.contains(title).should('be.visible')
})