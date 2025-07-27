import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
  // Selectors
  private readonly usernameInput = '[data-cy="username-input"]'
  private readonly passwordInput = '[data-cy="password-input"]'
  private readonly loginButton = '[data-cy="login-button"]'
  private readonly switchToRegisterButton = '[data-cy="switch-to-register-button"]'
  private readonly errorMessage = '[data-cy="error-message"]'

  /**
   * Visit login page
   */
  visitLoginPage(): void {
    this.visit('/')
    this.waitForPageLoad()
  }

  /**
   * Check if login page is loaded
   */
  isLoginPageLoaded(): void {
    cy.get(this.usernameInput).should('be.visible')
    cy.get(this.passwordInput).should('be.visible')
    cy.get(this.loginButton).should('be.visible')
  }

  /**
   * Enter username
   */
  enterUsername(username: string): void {
    this.typeInInput(this.usernameInput, username, { clear: true })
  }

  /**
   * Enter password
   */
  enterPassword(password: string): void {
    this.typeInInput(this.passwordInput, password, { clear: true })
  }

  /**
   * Click login button
   */
  clickLoginButton(): void {
    this.clickElement(this.loginButton)
  }

  /**
   * Perform login with credentials
   */
  login(username: string, password: string): void {
    this.enterUsername(username)
    this.enterPassword(password)
    this.clickLoginButton()
    cy.wait('@loginRequest')
  }

  /**
   * Login with valid admin credentials
   */
  loginAsAdmin(): void {
    const adminUsername = Cypress.env('adminUsername')
    const adminPassword = Cypress.env('adminPassword')
    this.login(adminUsername, adminPassword)
  }

  /**
   * Login with valid regular user credentials
   */
  loginAsRegularUser(): void {
    const regularUsername = Cypress.env('regularUsername')
    const regularPassword = Cypress.env('regularPassword')
    this.login(regularUsername, regularPassword)
  }

  /**
   * Attempt login with invalid credentials
   */
  loginWithInvalidCredentials(username: string, password: string): void {
    this.enterUsername(username)
    this.enterPassword(password)
    this.clickLoginButton()
    // Wait for the API call and expect it to fail
    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response?.statusCode).to.equal(401)
    })
  }

  /**
   * Switch to register page
   */
  switchToRegister(): void {
    this.clickElement(this.switchToRegisterButton)
  }

  /**
   * Verify login was successful
   */
  verifyLoginSuccess(): void {
    cy.url().should('not.include', '/login')
    cy.get('[data-cy="logout-button"]').should('be.visible')
    cy.contains('Welcome,').should('be.visible')
  }

  /**
   * Verify login failed with error message
   */
  verifyLoginFailed(errorMessage?: string): void {
    // Wait for error message to appear with extended timeout
    cy.get(this.errorMessage, { timeout: 15000 }).should('be.visible')
    if (errorMessage) {
      cy.get(this.errorMessage).should('contain.text', errorMessage)
    }
    // Should still be on login page
    cy.url().should('include', '/')
    cy.get(this.usernameInput).should('be.visible')
  }

  /**
   * Verify required field validation
   */
  verifyRequiredFieldValidation(): void {
    this.clickLoginButton()
    this.verifyErrorMessage('Please fill in all fields')
  }

  /**
   * Clear login form
   */
  clearLoginForm(): void {
    cy.get(this.usernameInput).clear()
    cy.get(this.passwordInput).clear()
  }

  /**
   * Check if login button is disabled
   */
  verifyLoginButtonDisabled(): void {
    cy.get(this.loginButton).should('be.disabled')
  }

  /**
   * Check if login button is enabled
   */
  verifyLoginButtonEnabled(): void {
    cy.get(this.loginButton).should('not.be.disabled')
  }

  /**
   * Verify demo accounts are shown
   */
  verifyDemoAccountsVisible(): void {
    cy.contains('Demo Accounts:').should('be.visible')
    cy.contains('Username: admin, Password: password').should('be.visible')
    cy.contains('Username: user1, Password: user123').should('be.visible')
  }
} 