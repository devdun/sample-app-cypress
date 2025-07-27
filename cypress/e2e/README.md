# 🧪 Cypress E2E Testing Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend running on `http://localhost:5000`  
- Frontend running on `http://localhost:3000`

### Start Services & Run Tests

```bash
# Option 1: All-in-one command (recommended)
npm run test:e2e

# Option 2: Start services manually
npm run start:services
npm run test:sanity

# Option 3: Interactive development
npm run cy:open
```

## 📋 Test Categories & Tags

### Core Test Categories

| Tag | Description | When to Run | Example |
|-----|-------------|-------------|---------|
| `@sanity` | 🟢 Critical functionality | Every push/PR | Login, CRUD basics |
| `@regression` | 🔵 Full test suite | Scheduled/releases | All edge cases |
| `@smoke` | 🟡 Quick validation | Post-deployment | Key user flows |

### Specialized Test Tags

| Tag | Focus Area | Tests |
|-----|------------|-------|
| `@auth` | Authentication | Login, logout, sessions |
| `@crud` | Data operations | Create, read, update, delete |
| `@security` | Security testing | XSS, SQL injection, validation |
| `@a11y` | Accessibility | Keyboard nav, focus, labels |
| `@performance` | Performance | Load times, rapid operations |
| `@responsive` | UI responsiveness | Different viewports |

## 🛠️ Available Commands

### Test Execution Commands

```bash
# By Test Category
npm run test:sanity        # Core functionality tests
npm run test:regression    # Complete test suite  
npm run test:smoke         # Quick smoke tests
npm run test:auth          # Authentication tests only
npm run test:crud          # CRUD operation tests
npm run test:security      # Security validation tests

# By Browser
npm run cy:run:chrome      # Run in Chrome
npm run cy:run:firefox     # Run in Firefox  
npm run cy:run:edge        # Run in Edge

# Development
npm run cy:open            # Interactive Cypress GUI
npm run cy:run             # Headless execution
```

### Service Management Commands  

```bash
# Start/stop services
npm run start:services     # Start backend + frontend
npm run start:backend      # Backend only (port 5000)
npm run start:frontend     # Frontend only (port 3000)

# Integrated testing
npm run test:e2e           # Start services + run tests
npm run test:e2e:sanity    # Start services + sanity tests
npm run test:e2e:regression # Start services + regression tests
```

## 🏗️ Test Architecture

### Page Object Model Structure

```
cypress/support/pages/
├── BasePage.ts          # Common functionality
├── LoginPage.ts         # Authentication
├── RegisterPage.ts      # User registration  
├── DashboardPage.ts     # Main navigation
├── ItemsPage.ts         # Item management
├── InventoryPage.ts     # Stock management
├── OrdersPage.ts        # Order lifecycle
└── index.ts            # Exports all pages
```

### Test Organization

```
cypress/e2e/
├── auth/
│   └── login.cy.ts     # Authentication tests
└── items/
    └── item-management.cy.ts # CRUD operations
```

### Support Files

```
cypress/support/
├── commands.ts         # Custom Cypress commands
├── e2e.ts             # Global setup & configuration
└── pages/             # Page Object Model classes
```

## 📊 Test Execution Examples

### Running Specific Test Suites

```bash
# Run only login tests
npm run cy:run -- --spec "cypress/e2e/auth/login.cy.ts"

# Run tests with specific tag (using grep)
npm run cy:run -- --env grepTags="@smoke"

# Run tests in headed mode (visible browser)
npm run cy:run -- --headed

# Run with custom configuration
npm run cy:run -- --config viewportWidth=1920,viewportHeight=1080
```

### Test Data & Environment Variables

```bash
# Test user credentials (configured in cypress.config.ts)
adminUsername: 'admin'
adminPassword: 'password'  
regularUsername: 'user1'
regularPassword: 'user123'

# API endpoints
apiUrl: 'http://localhost:5000'
baseUrl: 'http://localhost:3000'
```

## 🔧 Page Object Model Usage

### Example: Login Test with Page Objects

```typescript
import { LoginPage, DashboardPage } from '../../support/pages'

describe('Authentication Tests', () => {
  let loginPage: LoginPage
  let dashboardPage: DashboardPage

  beforeEach(() => {
    loginPage = new LoginPage()
    dashboardPage = new DashboardPage()
    loginPage.visitLoginPage()
  })

  it('should login successfully', () => {
    loginPage.loginAsAdmin()
    dashboardPage.isDashboardLoaded()
    dashboardPage.verifyUserLoggedIn('admin')
  })
})
```

### Available Page Object Methods

#### LoginPage
```typescript
// Navigation
visitLoginPage()

// Actions  
loginAsAdmin()
loginAsRegularUser()
loginWithInvalidCredentials(username, password)
switchToRegister()

// Verifications
verifyLoginSuccess()
verifyLoginFailed(errorMessage?)
```

#### ItemsPage
```typescript
// CRUD Operations
createItem(title, description)
editItem(currentTitle, newTitle, newDescription)  
deleteItem(title)

// Verifications
verifyItemExists(title)
verifyItemEdited(title, description)
verifyItemDeleted(title)
verifyItemsCountInHeader(count)
```

## 🐛 Debugging & Troubleshooting

### Common Issues & Solutions

#### 1. Services Not Running
```bash
# Error: "Expected to find element but never found it"
# Solution: Ensure services are running
npm run start:services
# Wait for "Compiled successfully!" message
```

#### 2. Port Conflicts
```bash
# Error: "EADDRINUSE: address already in use"
# Solution: Kill existing processes
lsof -ti:3000 | xargs kill -9  # Kill frontend
lsof -ti:5000 | xargs kill -9  # Kill backend
```

#### 3. Test Data Accumulation  
```bash
# Issue: Tests fail due to previous test data
# Solution: Tests are designed to be flexible with counts
# Each test creates unique items with timestamps
```

### Debugging Commands

```bash
# Run tests with debug output
DEBUG=cypress:* npm run cy:run

# Open Cypress with debug console
npm run cy:open
# Then use browser dev tools in Cypress

# Run single test with verbose output
npm run cy:run -- --spec "cypress/e2e/auth/login.cy.ts" --headed
```

### Screenshots & Videos

```bash
# Test artifacts are automatically saved on failures:
cypress/screenshots/     # Failure screenshots  
cypress/videos/         # Test execution videos

# Disable video recording (faster execution)
npm run cy:run -- --config video=false
```

## 🚀 CI/CD Integration

### GitHub Actions Workflows

#### Sanity Tests (On Push/PR)
```yaml
# Runs on: push to main/develop, pull requests
# Tests: @sanity tagged tests only
# Trigger: .github/workflows/sanity-tests.yml
```

#### Regression Tests (Scheduled)  
```yaml
# Runs on: cron schedule every 6 hours
# Tests: @regression tagged tests (complete suite)
# Trigger: .github/workflows/regression-tests.yml
```

### CI Execution

```bash
# GitHub Actions automatically runs:
npm run test:e2e:sanity     # On push/PR
npm run test:e2e:regression # Every 6 hours

# Local simulation of CI:
npm run test:e2e           # Full CI simulation
```

## 📈 Best Practices

### Writing Tests

1. **Use Page Objects** - Keep selectors and actions organized
2. **Add Proper Tags** - Use `@sanity`, `@regression`, etc.
3. **Unique Test Data** - Use timestamps to avoid conflicts
4. **Proper Wait Strategies** - Use `cy.wait('@apiCall')` for API calls
5. **Clear Test Names** - Describe expected behavior

### Maintenance

1. **Regular Updates** - Keep Cypress and dependencies updated
2. **Selector Stability** - Use `data-cy` attributes for test selectors
3. **Test Independence** - Each test should run independently  
4. **Clean Assertions** - Use specific, meaningful assertions

### Performance Tips

```bash
# Faster test execution
npm run cy:run -- --config video=false screenshotOnRunFailure=false

# Parallel execution (Cypress Cloud)
npm run cy:run -- --parallel --record

# Quiet output
npm run cy:run:sanity  # Uses --quiet flag
```

## 📚 Additional Resources

- **Cypress Documentation**: https://docs.cypress.io
- **Page Object Model Guide**: https://docs.cypress.io/guides/references/best-practices#Page-Objects
- **TypeScript with Cypress**: https://docs.cypress.io/guides/tooling/typescript-support
- **@cypress/grep Plugin**: https://github.com/cypress-io/cypress/tree/develop/npm/grep

## 🆘 Getting Help

If you encounter issues:

1. **Check the main README.md** for basic setup
2. **Review test artifacts** in `cypress/screenshots/` and `cypress/videos/`
3. **Run tests with `--headed`** to see what's happening
4. **Check browser console** in Cypress for errors
5. **Verify services are running** on correct ports

---

**Happy Testing!** 🎉🧪 