# API Test Automation

Comprehensive API testing for the Inventory Management System using Newman (Postman's CLI runner).

## 🎯 Test Coverage

### **Endpoints Tested:**
- `POST /login` - Authentication
- `GET /items` - Retrieve items  
- `POST /items` - Create items
- `PUT /items/:id` - Update items
- `DELETE /items/:id` - Delete items

### **Test Types:**
- ✅ **Positive Tests**: Valid requests with expected responses
- ❌ **Negative Tests**: Invalid requests and error handling  
- 🔒 **Authentication Tests**: Login flow and token validation
- 📝 **CRUD Tests**: Create, Read, Update, Delete operations

## 🚀 Quick Start

### **Prerequisites:**
```bash
# Install dependencies
npm install

# Install Newman globally (optional)
npm install -g newman newman-reporter-htmlextra
```

### **Running API Tests:**

#### **Option 1: With Auto Server Startup**
```bash
# Starts backend automatically and runs tests
npm run test:api:with-server
```

#### **Option 2: Manual Server Management**
```bash
# Terminal 1: Start backend server
cd backend && npm start

# Terminal 2: Run API tests
npm run test:api
```

#### **Option 3: Using Newman Directly**
```bash
# Make sure backend is running on http://localhost:5000
newman run tests/api/inventory-api-tests.postman_collection.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export tests/api/reports/api-report.html
```

## 📊 Test Results

### **Console Output:**
- Real-time test execution results
- Pass/fail status for each test
- Response times and status codes
- Error details for failed tests

### **HTML Report:**
- Generated at: `tests/api/reports/api-test-report.html`
- Interactive dashboard with detailed results
- Request/response data for each test
- Performance metrics and charts

### **JUnit XML:**
- Generated at: `tests/api/reports/api-test-results.xml`
- Compatible with CI/CD systems
- Structured test results for automation

## 🧪 Test Structure

### **Collection Organization:**
```
📁 Inventory Management API Tests
├── 🏥 Health Check
├── 🔐 Authentication
│   ├── Login Valid Credentials (Positive)
│   └── Login Invalid Credentials (Negative)
├── 📋 Items CRUD
│   ├── GET All Items (Positive)
│   ├── GET All Items Without Auth (Negative)
│   ├── POST Create Item (Positive)
│   ├── POST Create Item Invalid Data (Negative)
│   ├── PUT Update Item (Positive)
│   ├── PUT Update Non-existent Item (Negative)
│   ├── DELETE Item (Positive)
│   └── DELETE Non-existent Item (Negative)
```

### **Test Assertions:**
- HTTP status code validation
- Response body structure verification
- Data type and format checking
- Error message validation
- Authentication token handling
- Response time performance checks

## ⚙️ Configuration

### **Environment Variables:**
- `base_url`: API base URL (default: http://localhost:5000)
- `auth_token`: JWT token (automatically set during login tests)
- `test_item_id`: Dynamic item ID for CRUD operations

### **Timeouts:**
- Request timeout: 10 seconds
- Script timeout: 5 seconds

## 🔄 CI/CD Integration

### **GitHub Actions:**
The API tests run automatically:
- **Every 12 hours** (scheduled at 00:00 and 12:00 UTC)
- **On push** to main/develop branches (when backend or API test files change)
- **Manual trigger** via GitHub Actions interface

### **Workflow Features:**
- ✅ Automatic backend server startup
- 📊 HTML and JUnit report generation
- 🚨 Issue creation on test failures
- 📦 Artifact uploads for test reports

## 🐛 Troubleshooting

### **Common Issues:**

#### **"ECONNREFUSED" Error:**
```bash
# Ensure backend server is running
cd backend && npm start

# Check if server is accessible
curl http://localhost:5000/health
```

#### **Authentication Failures:**
- Tests automatically handle login and token storage
- Check if backend users exist (admin/password, user1/user123)
- Verify JWT_SECRET environment variable

#### **Test Data Conflicts:**
- Tests use dynamic timestamps to avoid conflicts
- Each test run creates unique test data
- Database is in-memory and resets on server restart

### **Debug Mode:**
```bash
# Run with verbose output
newman run tests/api/inventory-api-tests.postman_collection.json --verbose

# Run single request
newman run tests/api/inventory-api-tests.postman_collection.json \
  --folder "Auth - Login Valid Credentials"
```

## 📈 Performance Expectations

### **Typical Response Times:**
- Health check: < 50ms
- Authentication: < 200ms  
- CRUD operations: < 500ms
- Full test suite: < 30 seconds

### **Test Metrics:**
- **Total Tests**: 11 API tests
- **Coverage**: 5 main endpoints + auth
- **Assertions**: ~30 validation checks
- **Success Rate**: Should be 100% for healthy API

## 🔧 Extending Tests

### **Adding New Tests:**
1. Import collection into Postman
2. Add new requests with test scripts
3. Export collection back to `inventory-api-tests.postman_collection.json`
4. Update this documentation

### **Custom Assertions:**
```javascript
// Example test script in Postman
pm.test("Custom validation", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('customField');
    pm.expect(responseJson.customField).to.be.a('string');
});
```

---

## 🎉 **Ready to Test!**

Your API test automation is now set up with:
- ✅ Comprehensive test coverage
- ✅ Automated CI/CD integration  
- ✅ Detailed reporting
- ✅ Error handling and notifications

Run `npm run test:api:with-server` to get started! 🚀 