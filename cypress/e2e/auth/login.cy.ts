import { LoginPage, RegisterPage, DashboardPage } from '../../support/pages'

describe('Login Functionality @auth', () => {
  let loginPage: LoginPage
  let registerPage: RegisterPage
  let dashboardPage: DashboardPage

  beforeEach(() => {
    loginPage = new LoginPage()
    registerPage = new RegisterPage()
    dashboardPage = new DashboardPage()
    
    loginPage.visitLoginPage()
  })

  context('Sanity Tests - Valid Login Scenarios @sanity', () => {
    it('should login successfully with valid admin credentials @sanity @smoke', () => {
      loginPage.isLoginPageLoaded()
      loginPage.loginAsAdmin()
      
      dashboardPage.isDashboardLoaded()
      dashboardPage.verifyUserLoggedIn('admin')
    })

    it('should login successfully with valid regular user credentials @sanity', () => {
      loginPage.isLoginPageLoaded()
      loginPage.loginAsRegularUser()
      
      dashboardPage.isDashboardLoaded()
      dashboardPage.verifyUserLoggedIn('user1')
    })

    it('should logout successfully @sanity @smoke', () => {
      loginPage.loginAsAdmin()
      dashboardPage.isDashboardLoaded()
      
      dashboardPage.logout()
      loginPage.isLoginPageLoaded()
    })
  })

  context('Regression Tests - Invalid Login Scenarios @regression', () => {
    it('should show error for invalid username @regression', () => {
      loginPage.isLoginPageLoaded()
      loginPage.loginWithInvalidCredentials('invaliduser', 'password')
      
      loginPage.verifyLoginFailed('Invalid credentials')
    })

    it('should show error for invalid password @regression', () => {
      loginPage.isLoginPageLoaded()
      loginPage.loginWithInvalidCredentials('admin', 'wrongpassword')
      
      loginPage.verifyLoginFailed('Invalid credentials')
    })

    it('should show error for both invalid username and password @regression', () => {
      loginPage.isLoginPageLoaded()
      loginPage.loginWithInvalidCredentials('invaliduser', 'wrongpassword')
      
      loginPage.verifyLoginFailed('Invalid credentials')
    })

    it('should show validation error for empty fields @sanity', () => {
      loginPage.isLoginPageLoaded()
      loginPage.verifyRequiredFieldValidation()
    })

    it('should show validation error for empty username @regression', () => {
      loginPage.isLoginPageLoaded()
      loginPage.enterPassword('password')
      loginPage.clickLoginButton()
      
      loginPage.verifyLoginFailed('Please fill in all fields')
    })

    it('should show validation error for empty password @regression', () => {
      loginPage.isLoginPageLoaded()
      loginPage.enterUsername('admin')
      loginPage.clickLoginButton()
      
      loginPage.verifyLoginFailed('Please fill in all fields')
    })
  })

  context('Regression Tests - UI Validation @regression', () => {
    it('should display all login form elements correctly @regression', () => {
      loginPage.isLoginPageLoaded()
      loginPage.verifyDemoAccountsVisible()
    })

    it('should clear error message when user starts typing @regression', () => {
      loginPage.isLoginPageLoaded()
      loginPage.loginWithInvalidCredentials('invalid', 'invalid')
      loginPage.verifyLoginFailed()
      
      // Start typing in username field
      loginPage.enterUsername('a')
      
      // Error should disappear
      cy.get('[data-cy="error-message"]').should('not.exist')
    })

    it('should navigate to register page and back @sanity', () => {
      loginPage.isLoginPageLoaded()
      loginPage.switchToRegister()
      
      registerPage.isRegisterPageLoaded()
      registerPage.switchToLogin()
      
      loginPage.isLoginPageLoaded()
    })

    it('should maintain form state during page interactions @regression', () => {
      loginPage.isLoginPageLoaded()
      loginPage.enterUsername('testuser')
      loginPage.enterPassword('testpass')
      
      // Verify values are maintained
      cy.get('[data-cy="username-input"]').should('have.value', 'testuser')
      cy.get('[data-cy="password-input"]').should('have.value', 'testpass')
    })
  })

  context('Regression Tests - Security @regression @security', () => {
    it('should not expose passwords in browser history or logs @regression @security', () => {
      loginPage.isLoginPageLoaded()
      loginPage.enterPassword('secretpassword')
      
      // Verify password field type is 'password'
      cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'password')
    })

    it('should handle SQL injection attempts safely @regression @security', () => {
      loginPage.isLoginPageLoaded()
      loginPage.loginWithInvalidCredentials("admin' OR '1'='1", "password")
      
      loginPage.verifyLoginFailed('Invalid credentials')
    })

    it('should handle XSS attempts safely @regression @security', () => {
      loginPage.isLoginPageLoaded()
      loginPage.loginWithInvalidCredentials('<script>alert("xss")</script>', 'password')
      
      loginPage.verifyLoginFailed('Invalid credentials')
      // Verify no script execution
      cy.window().its('alert').should('not.exist')
    })
  })

  context('Regression Tests - Session Management @regression', () => {
    it('should maintain session on page refresh @regression', () => {
      loginPage.loginAsAdmin()
      dashboardPage.isDashboardLoaded()
      
      dashboardPage.refreshPage()
      dashboardPage.isDashboardLoaded()
      dashboardPage.verifyUserLoggedIn('admin')
    })

    it('should redirect to login page when accessing protected routes without authentication @sanity', () => {
      cy.visit('/')
      loginPage.isLoginPageLoaded()
    })

    it('should clear session data on logout @regression', () => {
      loginPage.loginAsAdmin()
      dashboardPage.isDashboardLoaded()
      
      dashboardPage.logout()
      
      // Verify local storage is cleared
      cy.window().its('localStorage').invoke('getItem', 'token').should('be.null')
      cy.window().its('localStorage').invoke('getItem', 'user').should('be.null')
    })
  })

  context('Regression Tests - Accessibility @regression @a11y', () => {
    it('should support keyboard navigation @regression @a11y', () => {
      loginPage.isLoginPageLoaded()
      
      // Tab through form elements using keyboard events
      cy.get('[data-cy="username-input"]').focus()
      cy.get('[data-cy="username-input"]').trigger('keydown', { key: 'Tab' })
      cy.get('[data-cy="password-input"]').should('be.focused')
      
      cy.get('[data-cy="password-input"]').trigger('keydown', { key: 'Tab' })
      cy.get('[data-cy="login-button"]').should('be.focused')
    })

    it('should have proper form labels and attributes @regression @a11y', () => {
      loginPage.isLoginPageLoaded()
      
      // Verify form labels
      cy.get('label[for="username"]').should('contain.text', 'Username')
      cy.get('label[for="password"]').should('contain.text', 'Password')
      
      // Verify input attributes
      cy.get('[data-cy="username-input"]').should('have.attr', 'placeholder')
      cy.get('[data-cy="password-input"]').should('have.attr', 'placeholder')
    })
  })

  context('Regression Tests - Performance @regression @performance', () => {
    it('should complete login within acceptable time limits @regression @performance', () => {
      loginPage.isLoginPageLoaded()
      
      const startTime = Date.now()
      loginPage.loginAsAdmin()
      dashboardPage.isDashboardLoaded()
      const endTime = Date.now()
      
      const loginTime = endTime - startTime
      expect(loginTime).to.be.lessThan(5000) // 5 seconds max
    })

    it('should handle multiple rapid login attempts gracefully @regression @performance', () => {
      loginPage.isLoginPageLoaded()
      
      // Attempt multiple rapid logins
      for (let i = 0; i < 3; i++) {
        loginPage.enterUsername('admin')
        loginPage.enterPassword('password')
        loginPage.clickLoginButton()
        cy.wait(100) // Small delay between attempts
      }
      
      // Should eventually succeed
      dashboardPage.isDashboardLoaded()
    })
  })
}) 