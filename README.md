# Todo App - React Frontend & Node.js Backend

A simple todo application built with React frontend and Node.js backend API, designed for automated testing with Cypress.

## 🚀 Quick Start (1-2 minutes setup)

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Setup & Run

1. **Clone and navigate to the project:**
   ```bash
   cd Project_And_Cypress
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Backend will run on http://localhost:5000

3. **Setup Frontend (in a new terminal):**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend will run on http://localhost:3000

4. **Access the application:**
   Open http://localhost:3000 in your browser

## 🔐 Demo Accounts

- **Admin User:** username: `admin`, password: `password`
- **Regular User:** username: `user1`, password: `user123`

## 📱 Features

### Authentication
- User login/logout
- JWT token-based authentication
- Session management
- Protected routes

### Todo Management
- View all user's todos
- Create new todos with title and description
- Edit existing todos
- Delete todos
- User-specific data isolation

## 🏗️ Architecture

### Backend (Node.js/Express)
- RESTful API following the provided diagram
- JWT authentication middleware
- In-memory data storage (for demo purposes)
- CORS enabled for frontend communication

### Frontend (React)
- Single Page Application (SPA)
- Component-based architecture
- Axios for API communication
- Local storage for token persistence
- Responsive design

## 📚 API Endpoints

### Authentication
- `POST /login` - User authentication
- `POST /logout` - User logout

### Items/Todos
- `GET /items` - Get user's items
- `GET /items/:id` - Get specific item
- `POST /items` - Create new item
- `PUT /items/:id` - Update item
- `DELETE /items/:id` - Delete item

### Health Check
- `GET /health` - Server health status

## 🗄️ Data Models

### User
- `id`: number (unique identifier)
- `username`: string
- `password`: string (bcrypt hashed)

### Session
- `token`: string (JWT token)
- `userId`: number (references User.id)
- `createdAt`: Date

### Item
- `id`: number (unique identifier)
- `title`: string (required)
- `description`: string (optional)
- `userId`: number (references User.id)

## 🧪 Testing Setup (Ready for Cypress)

The application includes:
- `data-cy` attributes on all interactive elements for easy testing
- Predictable API responses
- Error handling and loading states
- Form validations

### Key Test Selectors
- `data-cy="username-input"` - Login username field
- `data-cy="password-input"` - Login password field
- `data-cy="login-button"` - Login submit button
- `data-cy="logout-button"` - Logout button
- `data-cy="new-item-title"` - New todo title input
- `data-cy="add-item-button"` - Add todo button
- `data-cy="edit-item-button"` - Edit todo button
- `data-cy="delete-item-button"` - Delete todo button
- `data-cy="error-message"` - Error message display
- `data-cy="success-message"` - Success message display

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm start  # Hot reload enabled
```

## 📁 Project Structure

```
Project_And_Cypress/
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Login.js
│       │   └── TodoApp.js
│       ├── services/
│       │   └── api.js
│       ├── App.js
│       ├── index.js
│       └── index.css
└── README.md
```

## 🚨 Known Limitations

- Data is stored in memory (lost on server restart)
- No database persistence
- Basic error handling
- No rate limiting
- No input sanitization beyond basic validation

## 🧪 Testing Framework

### Cypress E2E Testing
This project includes a comprehensive **Cypress testing framework** with TypeScript and Page Object Model:

```bash
# Quick start - run sanity tests
npm run test:sanity

# Open Cypress interactively  
npm run cy:open

# Run all tests
npm run test:all
```

**Test Categories:**
- 🟢 **Sanity Tests** (`@sanity`) - Core functionality
- 🔵 **Regression Tests** (`@regression`) - Full test suite  
- 🟡 **Smoke Tests** (`@smoke`) - Quick validation

**Available Test Commands:**
```bash
npm run test:sanity        # Critical tests only
npm run test:regression    # Complete test suite
npm run test:auth          # Authentication tests
npm run test:crud          # CRUD operations
npm run test:security      # Security tests
```

### CI/CD Integration
- ✅ **GitHub Actions** - Automated testing on push/PR
- ✅ **Scheduled Tests** - Regression tests every 6 hours
- ✅ **Test Reports** - Detailed results and artifacts

📖 **For detailed testing instructions, see:** [`cypress/e2e/README.md`](cypress/e2e/README.md) 