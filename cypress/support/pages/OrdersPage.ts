import { BasePage } from './BasePage'

export class OrdersPage extends BasePage {
  // Selectors
  private readonly itemSelect = '[data-cy="order-item-select"]'
  private readonly quantityInput = '[data-cy="order-quantity-input"]'
  private readonly createOrderButton = '[data-cy="create-order-button"]'
  private readonly orderItem = '[data-cy="order-item"]'
  private readonly orderTitle = '[data-cy="order-title"]'
  private readonly orderDescription = '[data-cy="order-description"]'
  private readonly orderQuantity = '[data-cy="order-quantity"]'
  private readonly orderStatus = '[data-cy="order-status"]'
  private readonly editOrderButton = '[data-cy="edit-order-button"]'
  private readonly cancelOrderButton = '[data-cy="cancel-order-button"]'
  private readonly editOrderQuantity = '[data-cy="edit-order-quantity"]'
  private readonly editOrderStatus = '[data-cy="edit-order-status"]'
  private readonly saveOrderButton = '[data-cy="save-order-button"]'
  private readonly cancelOrderEditButton = '[data-cy="cancel-order-edit-button"]'
  private readonly errorMessage = '[data-cy="orders-error-message"]'
  private readonly successMessage = '[data-cy="orders-success-message"]'
  private readonly noItemsMessage = '.no-items'

  /**
   * Verify orders page is loaded
   */
  isOrdersPageLoaded(): void {
    cy.contains('Order Management').should('be.visible')
    cy.contains('Create New Order').should('be.visible')
    cy.get(this.itemSelect).should('be.visible')
  }

  /**
   * Create a new order
   */
  createOrder(itemName: string, quantity: number): void {
    cy.get(this.itemSelect).select(itemName)
    cy.get(this.quantityInput).clear().type(quantity.toString())
    cy.get(this.createOrderButton).click()
    cy.wait('@createOrder')
  }

  /**
   * Verify order was created successfully
   */
  verifyOrderCreated(itemName: string, quantity: number): void {
    cy.contains(itemName).should('be.visible')
    cy.contains(`${quantity}`).should('be.visible')
    cy.contains('pending').should('be.visible')
    this.verifySuccessMessage('Order created successfully')
  }

  /**
   * Edit order quantity and/or status
   */
  editOrder(orderTitle: string, newQuantity?: number, newStatus?: string): void {
    this.clickEditButtonForOrder(orderTitle)
    
    if (newQuantity) {
      cy.get(this.editOrderQuantity).clear().type(newQuantity.toString())
    }
    
    if (newStatus) {
      cy.get(this.editOrderStatus).select(newStatus)
    }
    
    cy.get(this.saveOrderButton).click()
    cy.wait('@updateOrder')
  }

  /**
   * Click edit button for specific order
   */
  clickEditButtonForOrder(orderTitle: string): void {
    cy.contains(this.orderItem, orderTitle)
      .find(this.editOrderButton)
      .click()
  }

  /**
   * Cancel order
   */
  cancelOrder(orderTitle: string): void {
    cy.contains(this.orderItem, orderTitle)
      .find(this.cancelOrderButton)
      .click()
    
    // Handle confirmation dialog
    cy.on('window:confirm', () => true)
    cy.wait('@deleteOrder')
  }

  /**
   * Cancel order and cancel confirmation dialog
   */
  cancelOrderWithDialogCancel(orderTitle: string): void {
    cy.contains(this.orderItem, orderTitle)
      .find(this.cancelOrderButton)
      .click()
    
    // Handle confirmation dialog - cancel
    cy.on('window:confirm', () => false)
  }

  /**
   * Cancel editing an order
   */
  cancelEditOrder(orderTitle: string): void {
    this.clickEditButtonForOrder(orderTitle)
    cy.get(this.cancelOrderEditButton).click()
  }

  /**
   * Verify order was updated successfully
   */
  verifyOrderUpdated(orderTitle: string, newQuantity?: number, newStatus?: string): void {
    const orderContainer = cy.contains(this.orderItem, orderTitle)
    
    if (newQuantity) {
      orderContainer.find(this.orderQuantity).should('contain.text', newQuantity.toString())
    }
    
    if (newStatus) {
      orderContainer.find(this.orderStatus).should('contain.text', newStatus)
    }
    
    this.verifySuccessMessage('Order updated successfully')
  }

  /**
   * Verify order was cancelled successfully
   */
  verifyOrderCancelled(orderTitle: string): void {
    cy.contains(this.orderItem, orderTitle).should('not.exist')
    this.verifySuccessMessage('Order cancelled successfully')
  }

  /**
   * Verify order still exists (after cancelled delete)
   */
  verifyOrderStillExists(orderTitle: string): void {
    cy.contains(this.orderItem, orderTitle).should('be.visible')
  }

  /**
   * Verify order status color coding
   */
  verifyOrderStatusColor(orderTitle: string, status: string): void {
    const expectedColors = {
      'pending': 'rgb(255, 193, 7)',
      'processing': 'rgb(23, 162, 184)',
      'completed': 'rgb(40, 167, 69)',
      'cancelled': 'rgb(220, 53, 69)'
    }
    
    const expectedColor = expectedColors[status as keyof typeof expectedColors]
    cy.contains(this.orderItem, orderTitle)
      .find(this.orderStatus)
      .should('have.css', 'color', expectedColor)
  }

  /**
   * Get available items for ordering
   */
  getAvailableItems(): Cypress.Chainable<string[]> {
    return cy.get(this.itemSelect).find('option').then($options => {
      const items: string[] = []
      $options.each((index, option) => {
        if (option.value) { // Skip empty option
          items.push(option.textContent || '')
        }
      })
      return items
    })
  }

  /**
   * Verify item is available for ordering
   */
  verifyItemAvailableForOrdering(itemName: string): void {
    cy.get(this.itemSelect).find('option').should('contain.text', itemName)
  }

  /**
   * Verify no items available message
   */
  verifyNoItemsAvailableMessage(): void {
    cy.contains('No items available in inventory. Please add stock first.').should('be.visible')
  }

  /**
   * Verify orders count in header
   */
  verifyOrdersCountInHeader(expectedCount: number): void {
    cy.contains(`Your Orders (${expectedCount})`).should('be.visible')
  }

  /**
   * Verify no orders message
   */
  verifyNoOrdersMessage(): void {
    cy.get(this.noItemsMessage).should('be.visible')
    cy.contains('No orders yet. Create your first order above!').should('be.visible')
  }

  /**
   * Verify required field validation
   */
  verifyRequiredFieldValidation(): void {
    cy.get(this.createOrderButton).click()
    this.verifyErrorMessage('Please select an item and enter quantity')
  }

  /**
   * Verify insufficient inventory validation
   */
  verifyInsufficientInventoryValidation(): void {
    this.verifyErrorMessage('Insufficient inventory')
  }

  /**
   * Verify order exists
   */
  verifyOrderExists(orderTitle: string, quantity: number, status: string): void {
    const orderContainer = cy.contains(this.orderItem, orderTitle)
    orderContainer.should('be.visible')
    orderContainer.find(this.orderQuantity).should('contain.text', quantity.toString())
    orderContainer.find(this.orderStatus).should('contain.text', status)
  }

  /**
   * Verify order does not exist
   */
  verifyOrderDoesNotExist(orderTitle: string): void {
    cy.contains(this.orderItem, orderTitle).should('not.exist')
  }

  /**
   * Get order status
   */
  getOrderStatus(orderTitle: string): Cypress.Chainable<string> {
    return cy.contains(this.orderItem, orderTitle)
      .find(this.orderStatus)
      .invoke('text')
  }

  /**
   * Get order quantity
   */
  getOrderQuantity(orderTitle: string): Cypress.Chainable<number> {
    return cy.contains(this.orderItem, orderTitle)
      .find(this.orderQuantity)
      .invoke('text')
      .then(text => parseInt(text))
  }

  /**
   * Clear order form
   */
  clearOrderForm(): void {
    cy.get(this.itemSelect).select('')
    cy.get(this.quantityInput).clear()
  }

  /**
   * Verify create order button is disabled
   */
  verifyCreateOrderButtonDisabled(): void {
    cy.get(this.createOrderButton).should('be.disabled')
  }

  /**
   * Fill order form
   */
  fillOrderForm(itemName: string, quantity: number): void {
    cy.get(this.itemSelect).select(itemName)
    cy.get(this.quantityInput).clear().type(quantity.toString())
  }

  /**
   * Verify form is cleared after successful order creation
   */
  verifyFormClearedAfterCreation(): void {
    cy.get(this.itemSelect).should('have.value', '')
    cy.get(this.quantityInput).should('have.value', '')
  }

  /**
   * Verify available quantity display for selected item
   */
  verifyAvailableQuantityDisplay(expectedQuantity: number): void {
    cy.contains(`Available: ${expectedQuantity} units`).should('be.visible')
  }

  /**
   * Verify edit and cancel buttons are not visible for completed/cancelled orders
   */
  verifyEditButtonsHiddenForCompletedOrder(orderTitle: string): void {
    cy.contains(this.orderItem, orderTitle)
      .find(this.editOrderButton)
      .should('not.exist')
    cy.contains(this.orderItem, orderTitle)
      .find(this.cancelOrderButton)
      .should('not.exist')
  }

  /**
   * Verify multiple orders exist
   */
  verifyMultipleOrdersExist(orderTitles: string[]): void {
    orderTitles.forEach(orderTitle => {
      cy.contains(this.orderItem, orderTitle).should('be.visible')
    })
  }

  /**
   * Verify orders are sorted by ID (newest first)
   */
  verifyOrdersSortedByNewest(): void {
    cy.get(this.orderItem).then($orders => {
      const orderIds: number[] = []
      
      $orders.each((index, element) => {
        const orderText = element.innerText
        const orderIdMatch = orderText.match(/Order #(\d+)/)
        if (orderIdMatch) {
          orderIds.push(parseInt(orderIdMatch[1]))
        }
      })
      
      // Verify orders are in descending order (newest first)
      for (let i = 0; i < orderIds.length - 1; i++) {
        expect(orderIds[i]).to.be.greaterThan(orderIds[i + 1])
      }
    })
  }
} 