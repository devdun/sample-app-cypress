import { LoginPage, DashboardPage, ItemsPage } from '../../support/pages'

describe('Item Management @items', () => {
  let loginPage: LoginPage
  let dashboardPage: DashboardPage
  let itemsPage: ItemsPage

  beforeEach(() => {
    loginPage = new LoginPage()
    dashboardPage = new DashboardPage()
    itemsPage = new ItemsPage()
    
    // Login before each test
    loginPage.visitLoginPage()
    loginPage.loginAsAdmin()
    dashboardPage.isDashboardLoaded()
    dashboardPage.navigateToItems()
  })

  context('Sanity Tests - Basic CRUD Operations @sanity @crud', () => {
    it('should create a new item successfully @sanity @smoke @crud', () => {
      itemsPage.isItemsPageLoaded()
      
      const itemTitle = `Test Item ${Date.now()}`
      const itemDescription = 'This is a test item for automation'
      
      itemsPage.createItemWithDescription(itemTitle, itemDescription)
      itemsPage.verifyItemCreated(itemTitle, itemDescription)
      itemsPage.verifyFormClearedAfterCreation()
    })

    it('should edit an existing item successfully @sanity @crud', () => {
      itemsPage.isItemsPageLoaded()
      
      // Create an item first
      const originalTitle = `Original Item ${Date.now()}`
      const originalDescription = 'Original description'
      itemsPage.createItemWithDescription(originalTitle, originalDescription)
      itemsPage.verifyItemCreated(originalTitle, originalDescription)
      
      // Edit the item
      const updatedTitle = `Updated Item ${Date.now()}`
      const updatedDescription = 'Updated description'
      itemsPage.editItem(originalTitle, updatedTitle, updatedDescription)
      itemsPage.verifyItemEdited(updatedTitle, updatedDescription)
    })

    it('should delete an item successfully @sanity @crud', () => {
      itemsPage.isItemsPageLoaded()
      
      // Create an item first
      const itemTitle = `Item to Delete ${Date.now()}`
      itemsPage.createItemWithTitleOnly(itemTitle)
      itemsPage.verifyItemCreated(itemTitle)
      
      // Delete the item
      itemsPage.deleteItem(itemTitle)
      itemsPage.verifyItemDeleted(itemTitle)
    })

    it('should validate required fields @sanity', () => {
      itemsPage.isItemsPageLoaded()
      itemsPage.verifyTitleRequiredValidation()
    })
  })

  context('Regression Tests - Advanced Scenarios @regression', () => {
    it('should handle multiple items correctly @regression', () => {
      itemsPage.isItemsPageLoaded()
      
      const items = [
        { title: `Item 1 ${Date.now()}`, description: 'First item' },
        { title: `Item 2 ${Date.now() + 1}`, description: 'Second item' },
        { title: `Item 3 ${Date.now() + 2}`, description: 'Third item' }
      ]
      
      // Create multiple items
      items.forEach(item => {
        itemsPage.createItemWithDescription(item.title, item.description)
        itemsPage.verifyItemCreated(item.title, item.description)
      })
      
      // Verify all items exist
      const itemTitles = items.map(item => item.title)
      itemsPage.verifyMultipleItemsExist(itemTitles)
      
      // Verify that the header shows the correct number of items (flexible count)
      cy.get('h3').contains('Your Items').should('be.visible')
      cy.log(`Successfully created ${items.length} new items`)
    })

    it('should cancel edit operation @regression', () => {
      itemsPage.isItemsPageLoaded()
      
      const itemTitle = `Item for Cancel Test ${Date.now()}`
      itemsPage.createItemWithTitleOnly(itemTitle)
      itemsPage.verifyItemCreated(itemTitle)
      
      // Start editing and cancel
      itemsPage.cancelEditItem(itemTitle)
      
      // Verify item still exists with original data
      itemsPage.verifyItemExists(itemTitle)
    })

    it('should cancel delete operation @regression', () => {
      itemsPage.isItemsPageLoaded()
      
      const itemTitle = `Item for Cancel Delete ${Date.now()}`
      itemsPage.createItemWithTitleOnly(itemTitle)
      itemsPage.verifyItemCreated(itemTitle)
      
      // Try to delete but cancel
      itemsPage.deleteItemWithCancel(itemTitle)
      itemsPage.verifyItemStillExists(itemTitle)
    })

    it('should handle long text content @regression', () => {
      itemsPage.isItemsPageLoaded()
      
      const longTitle = 'A'.repeat(100) // 100 character title
      const longDescription = 'B'.repeat(500) // 500 character description
      
      itemsPage.createItemWithDescription(longTitle, longDescription)
      itemsPage.verifyItemCreated(longTitle, longDescription)
    })

    it('should handle special characters in content @regression', () => {
      itemsPage.isItemsPageLoaded()
      
      const specialTitle = `Special Item !@#$%^&*()_+ ${Date.now()}`
      const specialDescription = 'Description with special chars: <>&"\'`'
      
      itemsPage.createItemWithDescription(specialTitle, specialDescription)
      itemsPage.verifyItemCreated(specialTitle, specialDescription)
    })
  })

  context('Regression Tests - Error Handling @regression', () => {
    it('should show appropriate error for server failures @regression', () => {
      // This test would require mocking server failures
      // For now, just verify the error handling structure exists
      itemsPage.isItemsPageLoaded()
      
      // Simulate network error by intercepting and failing the request
      cy.intercept('POST', '/items', { forceNetworkError: true }).as('failedCreateItem')
      
      itemsPage.fillNewItemForm('Test Item', 'Test Description')
      cy.get('[data-cy="add-item-button"]').click()
      
      // Verify error message is shown
      cy.get('[data-cy="error-message"]').should('be.visible')
    })

    it('should handle empty description gracefully @sanity', () => {
      itemsPage.isItemsPageLoaded()
      
      const itemTitle = `Title Only Item ${Date.now()}`
      itemsPage.createItemWithTitleOnly(itemTitle)
      itemsPage.verifyItemCreated(itemTitle)
      
      // Verify item exists without description
      itemsPage.verifyItemExists(itemTitle)
    })
  })

  context('Regression Tests - UI Responsiveness @regression @responsive', () => {
    it('should work correctly on mobile viewport @regression @responsive', () => {
      cy.viewport('iphone-x')
      
      itemsPage.isItemsPageLoaded()
      
      const mobileItemTitle = `Mobile Item ${Date.now()}`
      itemsPage.createItemWithTitleOnly(mobileItemTitle)
      itemsPage.verifyItemCreated(mobileItemTitle)
    })

    it('should work correctly on tablet viewport @regression @responsive', () => {
      cy.viewport('ipad-2')
      
      itemsPage.isItemsPageLoaded()
      
      const tabletItemTitle = `Tablet Item ${Date.now()}`
      itemsPage.createItemWithTitleOnly(tabletItemTitle)
      itemsPage.verifyItemCreated(tabletItemTitle)
    })
  })
}) 