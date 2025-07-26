const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage (for demo purposes)
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('password', 10) // password: "password"
  },
  {
    id: 2,
    username: 'user1',
    password: bcrypt.hashSync('user123', 10) // password: "user123"
  }
];

const sessions = [];
const items = [
  {
    id: 1,
    title: 'Laptop',
    description: 'High-performance laptop for development',
    userId: 1
  },
  {
    id: 2,
    title: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    userId: 1
  },
  {
    id: 3,
    title: 'Coffee Mug',
    description: 'Ceramic coffee mug',
    userId: 2
  }
];

const inventory = [
  {
    id: 1,
    itemId: 1,
    quantity: 10
  },
  {
    id: 2,
    itemId: 2,
    quantity: 25
  },
  {
    id: 3,
    itemId: 3,
    quantity: 15
  }
];

const orders = [
  {
    id: 1,
    userId: 1,
    itemId: 1,
    quantity: 2,
    status: 'pending'
  },
  {
    id: 2,
    userId: 1,
    itemId: 2,
    quantity: 1,
    status: 'completed'
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth endpoints
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const session = {
      token,
      userId: user.id,
      createdAt: new Date()
    };
    sessions.push(session);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/logout', authenticateToken, (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    const sessionIndex = sessions.findIndex(s => s.token === token);
    
    if (sessionIndex > -1) {
      sessions.splice(sessionIndex, 1);
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword
    };

    users.push(newUser);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/me', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Items endpoints
app.get('/items', authenticateToken, (req, res) => {
  try {
    const userItems = items.filter(item => item.userId === req.user.id);
    res.json(userItems);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/items/:id', authenticateToken, (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const item = items.find(item => item.id === itemId && item.userId === req.user.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/items', authenticateToken, (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newItem = {
      id: items.length + 1,
      title,
      description: description || '',
      userId: req.user.id
    };

    items.push(newItem);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/items/:id', authenticateToken, (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const { title, description } = req.body;

    const itemIndex = items.findIndex(item => item.id === itemId && item.userId === req.user.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    items[itemIndex] = {
      ...items[itemIndex],
      title,
      description: description || items[itemIndex].description
    };

    res.json(items[itemIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/items/:id', authenticateToken, (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const itemIndex = items.findIndex(item => item.id === itemId && item.userId === req.user.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const deletedItem = items.splice(itemIndex, 1)[0];
    
    // Also remove inventory for this item
    const inventoryIndex = inventory.findIndex(inv => inv.itemId === itemId);
    if (inventoryIndex > -1) {
      inventory.splice(inventoryIndex, 1);
    }
    
    res.json({ message: 'Item deleted successfully', item: deletedItem });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Inventory endpoints
app.get('/inventory', authenticateToken, (req, res) => {
  try {
    // Get inventory with item details
    const inventoryWithItems = inventory.map(inv => {
      const item = items.find(item => item.id === inv.itemId);
      return {
        ...inv,
        item: item || null
      };
    }).filter(inv => inv.item); // Only return inventory for existing items

    res.json(inventoryWithItems);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/inventory/:itemId', authenticateToken, (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const inventoryItem = inventory.find(inv => inv.itemId === itemId);
    
    if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const item = items.find(item => item.id === itemId);
    
    res.json({
      ...inventoryItem,
      item: item || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/inventory', authenticateToken, (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || quantity === undefined) {
      return res.status(400).json({ error: 'ItemId and quantity are required' });
    }

    if (quantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    const item = items.find(item => item.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const existingInventory = inventory.find(inv => inv.itemId === itemId);
    if (existingInventory) {
      return res.status(409).json({ error: 'Inventory already exists for this item' });
    }

    const newInventory = {
      id: inventory.length + 1,
      itemId: parseInt(itemId),
      quantity: parseInt(quantity)
    };

    inventory.push(newInventory);
    res.status(201).json(newInventory);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/inventory/:itemId', authenticateToken, (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ error: 'Quantity is required' });
    }

    if (quantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    const inventoryIndex = inventory.findIndex(inv => inv.itemId === itemId);
    
    if (inventoryIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    inventory[inventoryIndex].quantity = parseInt(quantity);
    res.json(inventory[inventoryIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/inventory/:itemId', authenticateToken, (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const inventoryIndex = inventory.findIndex(inv => inv.itemId === itemId);
    
    if (inventoryIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const deletedInventory = inventory.splice(inventoryIndex, 1)[0];
    res.json({ message: 'Inventory item removed successfully', inventory: deletedInventory });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Orders endpoints
app.get('/orders', authenticateToken, (req, res) => {
  try {
    const userOrders = orders.filter(order => order.userId === req.user.id);
    
    // Enrich orders with item details
    const ordersWithItems = userOrders.map(order => {
      const item = items.find(item => item.id === order.itemId);
      return {
        ...order,
        item: item || null
      };
    });

    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/orders/:id', authenticateToken, (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = orders.find(order => order.id === orderId && order.userId === req.user.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const item = items.find(item => item.id === order.itemId);
    
    res.json({
      ...order,
      item: item || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/orders', authenticateToken, (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({ error: 'ItemId and quantity are required' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const item = items.find(item => item.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check inventory availability
    const inventoryItem = inventory.find(inv => inv.itemId === itemId);
    if (!inventoryItem || inventoryItem.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient inventory' });
    }

    const newOrder = {
      id: orders.length + 1,
      userId: req.user.id,
      itemId: parseInt(itemId),
      quantity: parseInt(quantity),
      status: 'pending'
    };

    orders.push(newOrder);
    
    // Reduce inventory
    inventoryItem.quantity -= quantity;

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/orders/:id', authenticateToken, (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status, quantity } = req.body;

    const orderIndex = orders.findIndex(order => order.id === orderId && order.userId === req.user.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];
    
    // If updating quantity, check inventory
    if (quantity !== undefined && quantity !== order.quantity) {
      const inventoryItem = inventory.find(inv => inv.itemId === order.itemId);
      if (!inventoryItem) {
        return res.status(400).json({ error: 'Item not in inventory' });
      }

      const quantityDiff = quantity - order.quantity;
      if (quantityDiff > 0 && inventoryItem.quantity < quantityDiff) {
        return res.status(400).json({ error: 'Insufficient inventory for quantity increase' });
      }

      // Update inventory
      inventoryItem.quantity -= quantityDiff;
      order.quantity = parseInt(quantity);
    }

    if (status) {
      const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      // If cancelling order, restore inventory
      if (status === 'cancelled' && order.status !== 'cancelled') {
        const inventoryItem = inventory.find(inv => inv.itemId === order.itemId);
        if (inventoryItem) {
          inventoryItem.quantity += order.quantity;
        }
      }
      
      order.status = status;
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/orders/:id', authenticateToken, (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const orderIndex = orders.findIndex(order => order.id === orderId && order.userId === req.user.id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const deletedOrder = orders.splice(orderIndex, 1)[0];
    
    // Restore inventory if order wasn't completed
    if (deletedOrder.status !== 'completed') {
      const inventoryItem = inventory.find(inv => inv.itemId === deletedOrder.itemId);
      if (inventoryItem) {
        inventoryItem.quantity += deletedOrder.quantity;
      }
    }

    res.json({ message: 'Order cancelled successfully', order: deletedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 