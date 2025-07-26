import { BasePage } from './BasePage'

export class RegisterPage extends BasePage {
  // Selectors
  private readonly usernameInput = '[data-cy="register-username-input"]'
  private readonly passwordInput = '[data-cy="register-password-input"]'
  private readonly confirmPasswordInput = '[data-cy="register-confirm-password-input"]'
  private readonly registerButton = '[data-cy="register-button"]'
  private readonly switchToLoginButton = '[data-cy="switch-to-login-button"]'
  private readonly errorMessage = '[data-cy="register-error-message"]'

  /**
   * Check if register page is loaded
   */
  isRegisterPageLoaded(): void {
    cy.get(this.usernameInput).should('be.visible')
    cy.get(this.passwordInput).should('be.visible')
    cy.get(this.confirmPasswordInput).should('be.visible')
    cy.get(this.registerButton).should('be.visible')
    cy.contains('Create Account').should('be.visible')
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
   * Enter confirm password
   */
  enterConfirmPassword(password: string): void {
    this.typeInInput(this.confirmPasswordInput, password, { clear: true })
  }

  /**
   * Click register button
   */
  clickRegisterButton(): void {
    this.clickElement(this.registerButton)
  }

  /**
   * Perform registration with user details
   */
  register(username: string, password: string, confirmPassword: string): void {
    this.enterUsername(username)
    this.enterPassword(password)
    this.enterConfirmPassword(confirmPassword)
    this.clickRegisterButton()
    cy.wait('@registerRequest')
  }

  /**
   * Register with valid credentials
   */
  registerNewUser(username: string, password: string = 'password123'): void {
    this.register(username, password, password)
  }

  /**
   * Register with mismatched passwords
   */
  registerWithMismatchedPasswords(username: string, password: string, confirmPassword: string): void {
    this.register(username, password, confirmPassword)
  }

  /**
   * Register with short password
   */
  registerWithShortPassword(username: string, password: string): void {
    this.register(username, password, password)
  }

  /**
   * Switch back to login page
   */
  switchToLogin(): void {
    this.clickElement(this.switchToLoginButton)
  }

  /**
   * Verify registration was successful
   */
  verifyRegistrationSuccess(): void {
    cy.contains('User created successfully').should('be.visible')
    cy.contains('Please login with your new account').should('be.visible')
    // Should redirect back to login page
    cy.get('[data-cy="username-input"]').should('be.visible')
  }

  /**
   * Verify registration failed with error message
   */
  verifyRegistrationFailed(errorMessage: string): void {
    cy.get(this.errorMessage).should('be.visible')
    cy.get(this.errorMessage).should('contain.text', errorMessage)
  }

  /**
   * Verify required field validation
   */
  verifyRequiredFieldValidation(): void {
    this.clickRegisterButton()
    this.verifyRegistrationFailed('Please fill in all fields')
  }

  /**
   * Verify password mismatch validation
   */
  verifyPasswordMismatchValidation(): void {
    this.verifyRegistrationFailed('Passwords do not match')
  }

  /**
   * Verify password length validation
   */
  verifyPasswordLengthValidation(): void {
    this.verifyRegistrationFailed('Password must be at least 6 characters')
  }

  /**
   * Verify username already exists error
   */
  verifyUsernameExistsError(): void {
    this.verifyRegistrationFailed('Username already exists')
  }

  /**
   * Clear registration form
   */
  clearRegistrationForm(): void {
    cy.get(this.usernameInput).clear()
    cy.get(this.passwordInput).clear()
    cy.get(this.confirmPasswordInput).clear()
  }

  /**
   * Check if register button is disabled
   */
  verifyRegisterButtonDisabled(): void {
    cy.get(this.registerButton).should('be.disabled')
  }

  /**
   * Check if register button is enabled
   */
  verifyRegisterButtonEnabled(): void {
    cy.get(this.registerButton).should('not.be.disabled')
  }

  /**
   * Verify form validation messages
   */
  verifyFormValidation(field: 'username' | 'password' | 'confirmPassword', message: string): void {
    const fieldSelector = field === 'username' ? this.usernameInput : 
                         field === 'password' ? this.passwordInput : this.confirmPasswordInput
    
    cy.get(fieldSelector).then($input => {
      const inputElement = $input[0] as HTMLInputElement
      expect(inputElement.validationMessage).to.include(message)
    })
  }
} 