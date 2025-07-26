import { BasePage } from './BasePage'

export class InventoryPage extends BasePage {
  // Selectors
  private readonly itemSelect = '[data-cy="inventory-item-select"]'
  private readonly quantityInput = '[data-cy="inventory-quantity-input"]'
  private readonly addInventoryButton = '[data-cy="add-inventory-button"]'
  private readonly inventoryItem = '[data-cy="inventory-item"]'
  private readonly inventoryItemTitle = '[data-cy="inventory-item-title"]'
  private readonly inventoryItemDescription = '[data-cy="inventory-item-description"]'
  private readonly inventoryQuantity = '[data-cy="inventory-quantity"]'
  private readonly editInventoryButton = '[data-cy="edit-inventory-button"]'
  private readonly deleteInventoryButton = '[data-cy="delete-inventory-button"]'
  private readonly editInventoryQuantity = '[data-cy="edit-inventory-quantity"]'
  private readonly saveInventoryButton = '[data-cy="save-inventory-button"]'
  private readonly cancelInventoryEditButton = '[data-cy="cancel-inventory-edit-button"]'
  private readonly errorMessage = '[data-cy="inventory-error-message"]'
  private readonly successMessage = '[data-cy="inventory-success-message"]'
  private readonly noItemsMessage = '.no-items'

  /**
   * Verify inventory page is loaded
   */
  isInventoryPageLoaded(): void {
    cy.contains('Inventory Management').should('be.visible')
    cy.contains('Add Stock').should('be.visible')
    cy.get(this.itemSelect).should('be.visible')
  }

  /**
   * Add item to inventory
   */
  addInventory(itemName: string, quantity: number): void {
    cy.get(this.itemSelect).select(itemName)
    cy.get(this.quantityInput).clear().type(quantity.toString())
    cy.get(this.addInventoryButton).click()
    cy.wait('@addInventory')
  }

  /**
   * Verify inventory was added successfully
   */
  verifyInventoryAdded(itemName: string, quantity: number): void {
    cy.contains(itemName).should('be.visible')
    cy.contains(`${quantity} units`).should('be.visible')
    this.verifySuccessMessage('Inventory added successfully')
  }

  /**
   * Edit inventory quantity
   */
  updateInventoryQuantity(itemName: string, newQuantity: number): void {
    this.clickEditButtonForInventoryItem(itemName)
    cy.get(this.editInventoryQuantity).clear().type(newQuantity.toString())
    cy.get(this.saveInventoryButton).click()
    cy.wait('@updateInventory')
  }

  /**
   * Click edit button for specific inventory item
   */
  clickEditButtonForInventoryItem(itemName: string): void {
    cy.contains(this.inventoryItem, itemName)
      .find(this.editInventoryButton)
      .click()
  }

  /**
   * Delete inventory item
   */
  deleteInventoryItem(itemName: string): void {
    cy.contains(this.inventoryItem, itemName)
      .find(this.deleteInventoryButton)
      .click()
    
    // Handle confirmation dialog
    cy.on('window:confirm', () => true)
    cy.wait('@deleteInventory')
  }

  /**
   * Cancel editing inventory
   */
  cancelEditInventory(itemName: string): void {
    this.clickEditButtonForInventoryItem(itemName)
    cy.get(this.cancelInventoryEditButton).click()
  }

  /**
   * Verify inventory was updated successfully
   */
  verifyInventoryUpdated(itemName: string, newQuantity: number): void {
    cy.contains(this.inventoryItem, itemName)
      .find(this.inventoryQuantity)
      .should('contain.text', newQuantity.toString())
    this.verifySuccessMessage('Inventory updated successfully')
  }

  /**
   * Verify inventory was deleted successfully
   */
  verifyInventoryDeleted(itemName: string): void {
    cy.contains(this.inventoryItem, itemName).should('not.exist')
    this.verifySuccessMessage('Inventory item removed successfully')
  }

  /**
   * Verify low stock warning
   */
  verifyLowStockWarning(itemName: string): void {
    cy.contains(this.inventoryItem, itemName)
      .should('contain.text', 'Low Stock!')
      .find(this.inventoryQuantity)
      .should('have.css', 'color', 'rgb(220, 53, 69)') // Red color for low stock
  }

  /**
   * Verify good stock level (green color)
   */
  verifyGoodStockLevel(itemName: string): void {
    cy.contains(this.inventoryItem, itemName)
      .find(this.inventoryQuantity)
      .should('have.css', 'color', 'rgb(40, 167, 69)') // Green color for good stock
  }

  /**
   * Get available items for inventory
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
   * Verify item is available for inventory selection
   */
  verifyItemAvailableForInventory(itemName: string): void {
    cy.get(this.itemSelect).find('option').should('contain.text', itemName)
  }

  /**
   * Verify item is not available for inventory selection (already has inventory)
   */
  verifyItemNotAvailableForInventory(itemName: string): void {
    cy.get(this.itemSelect).find('option').should('not.contain.text', itemName)
  }

  /**
   * Verify inventory count in header
   */
  verifyInventoryCountInHeader(expectedCount: number): void {
    cy.contains(`Current Inventory (${expectedCount} items)`).should('be.visible')
  }

  /**
   * Verify no inventory items message
   */
  verifyNoInventoryMessage(): void {
    cy.get(this.noItemsMessage).should('be.visible')
    cy.contains('No inventory items yet. Add stock above!').should('be.visible')
  }

  /**
   * Verify required field validation
   */
  verifyRequiredFieldValidation(): void {
    cy.get(this.addInventoryButton).click()
    this.verifyErrorMessage('Please select an item and enter quantity')
  }

  /**
   * Verify negative quantity validation
   */
  verifyNegativeQuantityValidation(): void {
    cy.get(this.quantityInput).clear().type('-5')
    this.verifyErrorMessage('Quantity cannot be negative')
  }

  /**
   * Verify inventory exists for item
   */
  verifyInventoryExists(itemName: string, quantity: number): void {
    const inventoryContainer = cy.contains(this.inventoryItem, itemName)
    inventoryContainer.should('be.visible')
    inventoryContainer.find(this.inventoryQuantity).should('contain.text', quantity.toString())
  }

  /**
   * Verify inventory does not exist for item
   */
  verifyInventoryDoesNotExist(itemName: string): void {
    cy.contains(this.inventoryItem, itemName).should('not.exist')
  }

  /**
   * Get inventory quantity for item
   */
  getInventoryQuantity(itemName: string): Cypress.Chainable<number> {
    return cy.contains(this.inventoryItem, itemName)
      .find(this.inventoryQuantity)
      .invoke('text')
      .then(text => parseInt(text))
  }

  /**
   * Clear inventory form
   */
  clearInventoryForm(): void {
    cy.get(this.itemSelect).select('')
    cy.get(this.quantityInput).clear()
  }

  /**
   * Verify add inventory button is disabled
   */
  verifyAddInventoryButtonDisabled(): void {
    cy.get(this.addInventoryButton).should('be.disabled')
  }

  /**
   * Fill inventory form
   */
  fillInventoryForm(itemName: string, quantity: number): void {
    cy.get(this.itemSelect).select(itemName)
    cy.get(this.quantityInput).clear().type(quantity.toString())
  }

  /**
   * Verify form is cleared after successful inventory addition
   */
  verifyFormClearedAfterAddition(): void {
    cy.get(this.itemSelect).should('have.value', '')
    cy.get(this.quantityInput).should('have.value', '')
  }

  /**
   * Verify multiple inventory items exist
   */
  verifyMultipleInventoryItemsExist(itemNames: string[]): void {
    itemNames.forEach(itemName => {
      cy.contains(this.inventoryItem, itemName).should('be.visible')
    })
  }

  /**
   * Verify stock level color coding
   */
  verifyStockLevelColoring(itemName: string, isLowStock: boolean): void {
    const expectedColor = isLowStock ? 'rgb(220, 53, 69)' : 'rgb(40, 167, 69)'
    cy.contains(this.inventoryItem, itemName)
      .find(this.inventoryQuantity)
      .should('have.css', 'color', expectedColor)
  }
} 