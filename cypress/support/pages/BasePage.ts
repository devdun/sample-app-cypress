export abstract class BasePage {
  protected baseUrl: string = Cypress.config('baseUrl') || 'http://localhost:3000'

  /**
   * Visit the page
   */
  visit(path: string = ''): void {
    cy.visit(path)
  }

  /**
   * Wait for page to load
   */
  waitForPageLoad(): void {
    cy.get('body').should('be.visible')
  }

  /**
   * Check if element exists
   */
  elementExists(selector: string): Cypress.Chainable<boolean> {
    return cy.get('body').then($body => {
      return $body.find(selector).length > 0
    })
  }

  /**
   * Wait for element to be visible
   */
  waitForElement(selector: string, timeout: number = 10000): void {
    cy.get(selector, { timeout }).should('be.visible')
  }

  /**
   * Click element with retry logic
   */
  clickElement(selector: string): void {
    cy.get(selector).should('be.visible').and('not.be.disabled').click()
  }

  /**
   * Type text into input field
   */
  typeInInput(selector: string, text: string, options?: { clear?: boolean }): void {
    const element = cy.get(selector).should('be.visible')
    if (options?.clear) {
      element.clear()
    }
    element.type(text)
  }

  /**
   * Select option from dropdown
   */
  selectOption(selector: string, value: string): void {
    cy.get(selector).select(value)
  }

  /**
   * Get text from element
   */
  getElementText(selector: string): Cypress.Chainable<string> {
    return cy.get(selector).invoke('text')
  }

  /**
   * Check if text is visible on page
   */
  verifyTextVisible(text: string): void {
    cy.contains(text).should('be.visible')
  }

  /**
   * Verify error message
   */
  verifyErrorMessage(message: string): void {
    cy.get('[data-cy*="error-message"]').should('contain.text', message)
  }

  /**
   * Verify success message
   */
  verifySuccessMessage(message: string): void {
    cy.get('[data-cy*="success-message"]').should('contain.text', message)
  }

  /**
   * Wait for loading to complete
   */
  waitForLoadingComplete(): void {
    cy.get('.loading').should('not.exist')
  }

  /**
   * Scroll to element
   */
  scrollToElement(selector: string): void {
    cy.get(selector).scrollIntoView()
  }
} 