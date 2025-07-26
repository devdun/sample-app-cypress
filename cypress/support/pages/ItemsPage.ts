import { BasePage } from './BasePage'

export class ItemsPage extends BasePage {
  // Selectors
  private readonly newItemTitle = '[data-cy="new-item-title"]'
  private readonly newItemDescription = '[data-cy="new-item-description"]'
  private readonly addItemButton = '[data-cy="add-item-button"]'
  private readonly itemElement = '[data-cy="item"]'
  private readonly itemTitle = '[data-cy="item-title"]'
  private readonly itemDescription = '[data-cy="item-description"]'
  private readonly editItemButton = '[data-cy="edit-item-button"]'
  private readonly deleteItemButton = '[data-cy="delete-item-button"]'
  private readonly editItemTitle = '[data-cy="edit-item-title"]'
  private readonly editItemDescription = '[data-cy="edit-item-description"]'
  private readonly saveItemButton = '[data-cy="save-item-button"]'
  private readonly cancelEditButton = '[data-cy="cancel-edit-button"]'
  private readonly noItemsMessage = '.no-items'

  /**
   * Verify items page is loaded
   */
  isItemsPageLoaded(): void {
    cy.contains('Add New Item').should('be.visible')
    cy.get(this.newItemTitle).should('be.visible')
    cy.get(this.addItemButton).should('be.visible')
  }

  /**
   * Create a new item
   */
  createItem(title: string, description?: string): void {
    cy.get(this.newItemTitle).clear().type(title)
    if (description) {
      cy.get(this.newItemDescription).clear().type(description)
    }
    cy.get(this.addItemButton).click()
    cy.wait('@createItem')
  }

  /**
   * Create item with title only
   */
  createItemWithTitleOnly(title: string): void {
    this.createItem(title)
  }

  /**
   * Create item with both title and description
   */
  createItemWithDescription(title: string, description: string): void {
    this.createItem(title, description)
  }

  /**
   * Verify item was created successfully
   */
  verifyItemCreated(title: string, description?: string): void {
    cy.contains(title).should('be.visible')
    if (description) {
      cy.contains(description).should('be.visible')
    }
    this.verifySuccessMessage('Item added successfully')
  }

  /**
   * Edit an existing item
   */
  editItem(currentTitle: string, newTitle: string, newDescription?: string): void {
    this.clickEditButtonForItem(currentTitle)
    
    cy.get(this.editItemTitle).clear().type(newTitle)
    if (newDescription !== undefined) {
      cy.get(this.editItemDescription).clear()
      if (newDescription) {
        cy.get(this.editItemDescription).type(newDescription)
      }
    }
    
    cy.get(this.saveItemButton).click()
    cy.wait('@updateItem')
  }

  /**
   * Click edit button for specific item
   */
  clickEditButtonForItem(itemTitle: string): void {
    cy.contains(this.itemElement, itemTitle)
      .find(this.editItemButton)
      .click()
  }

  /**
   * Cancel editing an item
   */
  cancelEditItem(itemTitle: string): void {
    this.clickEditButtonForItem(itemTitle)
    cy.get(this.cancelEditButton).click()
  }

  /**
   * Delete an item
   */
  deleteItem(itemTitle: string): void {
    cy.contains(this.itemElement, itemTitle)
      .find(this.deleteItemButton)
      .click()
    
    // Handle confirmation dialog
    cy.on('window:confirm', () => true)
    cy.wait('@deleteItem')
  }

  /**
   * Delete item and cancel confirmation
   */
  deleteItemWithCancel(itemTitle: string): void {
    cy.contains(this.itemElement, itemTitle)
      .find(this.deleteItemButton)
      .click()
    
    // Handle confirmation dialog - cancel
    cy.on('window:confirm', () => false)
  }

  /**
   * Verify item was edited successfully
   */
  verifyItemEdited(newTitle: string, newDescription?: string): void {
    cy.contains(newTitle).should('be.visible')
    if (newDescription) {
      cy.contains(newDescription).should('be.visible')
    }
    this.verifySuccessMessage('Item updated successfully')
  }

  /**
   * Verify item was deleted successfully
   */
  verifyItemDeleted(itemTitle: string): void {
    cy.contains(itemTitle).should('not.exist')
    this.verifySuccessMessage('Item deleted successfully')
  }

  /**
   * Verify item still exists (after cancelled delete)
   */
  verifyItemStillExists(itemTitle: string): void {
    cy.contains(itemTitle).should('be.visible')
  }

  /**
   * Get all items on the page
   */
  getAllItems(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.itemElement)
  }

  /**
   * Get items count
   */
  getItemsCount(): Cypress.Chainable<number> {
    return this.getAllItems().then($items => $items.length)
  }

  /**
   * Verify specific item exists
   */
  verifyItemExists(title: string, description?: string): void {
    const itemContainer = cy.contains(this.itemElement, title)
    itemContainer.should('be.visible')
    
    if (description) {
      itemContainer.should('contain.text', description)
    }
  }

  /**
   * Verify item does not exist
   */
  verifyItemDoesNotExist(title: string): void {
    cy.contains(this.itemElement, title).should('not.exist')
  }

  /**
   * Verify no items message is displayed
   */
  verifyNoItemsMessage(): void {
    cy.get(this.noItemsMessage).should('be.visible')
    cy.contains('No items yet. Add your first item above!').should('be.visible')
  }

  /**
   * Verify items count in header
   */
  verifyItemsCountInHeader(expectedCount: number): void {
    cy.contains(`Your Items (${expectedCount})`).should('be.visible')
  }

  /**
   * Verify required field validation for title
   */
  verifyTitleRequiredValidation(): void {
    cy.get(this.addItemButton).click()
    this.verifyErrorMessage('Title is required')
  }

  /**
   * Clear new item form
   */
  clearNewItemForm(): void {
    cy.get(this.newItemTitle).clear()
    cy.get(this.newItemDescription).clear()
  }

  /**
   * Verify add button is disabled when title is empty
   */
  verifyAddButtonDisabledWhenTitleEmpty(): void {
    this.clearNewItemForm()
    cy.get(this.addItemButton).should('be.disabled')
  }

  /**
   * Fill new item form
   */
  fillNewItemForm(title: string, description?: string): void {
    cy.get(this.newItemTitle).clear().type(title)
    if (description) {
      cy.get(this.newItemDescription).clear().type(description)
    }
  }

  /**
   * Verify form is cleared after successful item creation
   */
  verifyFormClearedAfterCreation(): void {
    cy.get(this.newItemTitle).should('have.value', '')
    cy.get(this.newItemDescription).should('have.value', '')
  }

  /**
   * Search/filter items by text (if search functionality exists)
   */
  searchItems(searchText: string): void {
    // This would be implemented if search functionality exists
    // For now, just verify items containing the text are visible
    cy.contains(searchText).should('be.visible')
  }

  /**
   * Verify multiple items exist
   */
  verifyMultipleItemsExist(itemTitles: string[]): void {
    itemTitles.forEach(title => {
      this.verifyItemExists(title)
    })
  }
} 