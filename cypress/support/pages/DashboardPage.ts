import { BasePage } from './BasePage'

export class DashboardPage extends BasePage {
  // Selectors
  private readonly logoutButton = '[data-cy="logout-button"]'
  private readonly itemsTab = '[data-cy="items-tab"]'
  private readonly inventoryTab = '[data-cy="inventory-tab"]'
  private readonly ordersTab = '[data-cy="orders-tab"]'
  private readonly welcomeMessage = 'Welcome,'
  private readonly headerTitle = 'h1'

  /**
   * Check if dashboard is loaded
   */
  isDashboardLoaded(): void {
    cy.get(this.headerTitle).should('contain.text', 'Inventory Management System')
    cy.contains(this.welcomeMessage).should('be.visible')
    cy.get(this.logoutButton).should('be.visible')
    this.verifyNavigationTabsVisible()
  }

  /**
   * Verify navigation tabs are visible
   */
  verifyNavigationTabsVisible(): void {
    cy.get(this.itemsTab).should('be.visible').and('contain.text', 'Items')
    cy.get(this.inventoryTab).should('be.visible').and('contain.text', 'Inventory')
    cy.get(this.ordersTab).should('be.visible').and('contain.text', 'Orders')
  }

  /**
   * Navigate to Items tab
   */
  navigateToItems(): void {
    this.clickElement(this.itemsTab)
    this.waitForLoadingComplete()
  }

  /**
   * Navigate to Inventory tab
   */
  navigateToInventory(): void {
    this.clickElement(this.inventoryTab)
    this.waitForLoadingComplete()
  }

  /**
   * Navigate to Orders tab
   */
  navigateToOrders(): void {
    this.clickElement(this.ordersTab)
    this.waitForLoadingComplete()
  }

  /**
   * Logout from the application
   */
  logout(): void {
    this.clickElement(this.logoutButton)
    // Verify redirected to login page
    cy.get('[data-cy="username-input"]').should('be.visible')
  }

  /**
   * Verify user is logged in
   */
  verifyUserLoggedIn(username: string): void {
    cy.contains(`${this.welcomeMessage} ${username}!`).should('be.visible')
    cy.get(this.logoutButton).should('be.visible')
  }

  /**
   * Verify active tab
   */
  verifyActiveTab(tab: 'items' | 'inventory' | 'orders'): void {
    const tabSelector = tab === 'items' ? this.itemsTab :
                       tab === 'inventory' ? this.inventoryTab : this.ordersTab
    
    cy.get(tabSelector).should('have.class', 'btn-primary')
  }

  /**
   * Get current username from welcome message
   */
  getCurrentUsername(): Cypress.Chainable<string> {
    return cy.contains(this.welcomeMessage).invoke('text').then(text => {
      return text.replace('Welcome, ', '').replace('!', '')
    })
  }

  /**
   * Verify error message is displayed
   */
  verifyErrorMessage(message: string): void {
    cy.get('[data-cy*="error-message"]').should('be.visible')
    cy.get('[data-cy*="error-message"]').should('contain.text', message)
  }

  /**
   * Verify success message is displayed
   */
  verifySuccessMessage(message: string): void {
    cy.get('[data-cy*="success-message"]').should('be.visible')
    cy.get('[data-cy*="success-message"]').should('contain.text', message)
  }

  /**
   * Wait for any messages to disappear
   */
  waitForMessagesToDisappear(): void {
    cy.get('[data-cy*="success-message"]', { timeout: 5000 }).should('not.exist')
  }

  /**
   * Verify no error messages are displayed
   */
  verifyNoErrorMessages(): void {
    cy.get('[data-cy*="error-message"]').should('not.exist')
  }

  /**
   * Verify no success messages are displayed
   */
  verifyNoSuccessMessages(): void {
    cy.get('[data-cy*="success-message"]').should('not.exist')
  }

  /**
   * Refresh the page
   */
  refreshPage(): void {
    cy.reload()
    this.waitForPageLoad()
  }

  /**
   * Navigate to specific tab by name
   */
  navigateToTab(tabName: 'items' | 'inventory' | 'orders'): void {
    switch (tabName) {
      case 'items':
        this.navigateToItems()
        break
      case 'inventory':
        this.navigateToInventory()
        break
      case 'orders':
        this.navigateToOrders()
        break
    }
  }
} 