import React, { useState, useEffect } from 'react';
import api from '../services/api';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [editingInventory, setEditingInventory] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryResponse, itemsResponse] = await Promise.all([
        api.get('/inventory'),
        api.get('/items')
      ]);
      setInventory(inventoryResponse.data);
      setItems(itemsResponse.data);
      setError('');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setSuccess('');
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    
    if (!selectedItemId || quantity === '') {
      showMessage('Please select an item and enter quantity', 'error');
      return;
    }

    if (parseInt(quantity) < 0) {
      showMessage('Quantity cannot be negative', 'error');
      return;
    }

    try {
      const response = await api.post('/inventory', {
        itemId: parseInt(selectedItemId),
        quantity: parseInt(quantity)
      });
      
      const item = items.find(item => item.id === parseInt(selectedItemId));
      setInventory([...inventory, { ...response.data, item }]);
      setSelectedItemId('');
      setQuantity('');
      showMessage('Inventory added successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add inventory';
      showMessage(errorMessage, 'error');
    }
  };

  const handleEditClick = (inventoryItem) => {
    setEditingInventory(inventoryItem.itemId);
    setEditQuantity(inventoryItem.quantity.toString());
  };

  const handleEditCancel = () => {
    setEditingInventory(null);
    setEditQuantity('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (editQuantity === '') {
      showMessage('Quantity is required', 'error');
      return;
    }

    if (parseInt(editQuantity) < 0) {
      showMessage('Quantity cannot be negative', 'error');
      return;
    }

    try {
      const response = await api.put(`/inventory/${editingInventory}`, {
        quantity: parseInt(editQuantity)
      });
      
      setInventory(inventory.map(inv => 
        inv.itemId === editingInventory 
          ? { ...inv, quantity: response.data.quantity }
          : inv
      ));
      setEditingInventory(null);
      setEditQuantity('');
      showMessage('Inventory updated successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update inventory';
      showMessage(errorMessage, 'error');
    }
  };

  const handleDeleteInventory = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this inventory item?')) {
      return;
    }

    try {
      await api.delete(`/inventory/${itemId}`);
      setInventory(inventory.filter(inv => inv.itemId !== itemId));
      showMessage('Inventory item removed successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to remove inventory';
      showMessage(errorMessage, 'error');
    }
  };

  // Get items that don't have inventory yet
  const availableItems = items.filter(item => 
    !inventory.some(inv => inv.itemId === item.id)
  );

  return (
    <div className="container">
      <h2>Inventory Management</h2>

      {/* Messages */}
      {error && <div className="error" data-cy="inventory-error-message">{error}</div>}
      {success && <div className="success" data-cy="inventory-success-message">{success}</div>}

      {/* Add New Inventory Form */}
      <div className="add-item-form">
        <h3>Add Stock</h3>
        <form onSubmit={handleAddInventory}>
          <div className="form-group">
            <label htmlFor="item-select">Select Item</label>
            <select
              id="item-select"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              data-cy="inventory-item-select"
            >
              <option value="">Choose an item...</option>
              {availableItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              min="0"
              data-cy="inventory-quantity-input"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!selectedItemId || quantity === ''}
            data-cy="add-inventory-button"
          >
            Add to Inventory
          </button>
        </form>
      </div>

      {/* Inventory List */}
      <div className="items-list">
        <h3>Current Inventory ({inventory.length} items)</h3>
        
        {loading ? (
          <div className="loading">Loading inventory...</div>
        ) : inventory.length === 0 ? (
          <div className="no-items">
            No inventory items yet. Add stock above!
          </div>
        ) : (
          inventory.map((inv) => (
            <div key={inv.itemId} className="item" data-cy="inventory-item">
              {editingInventory === inv.itemId ? (
                // Edit Form
                <form onSubmit={handleEditSubmit} style={{ width: '100%' }}>
                  <div className="item-content">
                    <h4>{inv.item?.title}</h4>
                    <p>{inv.item?.description}</p>
                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        min="0"
                        data-cy="edit-inventory-quantity"
                      />
                    </div>
                  </div>

                  <div className="item-actions">
                    <button type="submit" className="btn btn-primary" data-cy="save-inventory-button">
                      Save
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={handleEditCancel}
                      data-cy="cancel-inventory-edit-button"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Display Inventory
                <>
                  <div className="item-content">
                    <h4 data-cy="inventory-item-title">{inv.item?.title}</h4>
                    <p data-cy="inventory-item-description">{inv.item?.description}</p>
                    <p style={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold', 
                      color: inv.quantity < 5 ? '#dc3545' : '#28a745' 
                    }}>
                      Stock: <span data-cy="inventory-quantity">{inv.quantity}</span> units
                      {inv.quantity < 5 && <span style={{ color: '#dc3545' }}> (Low Stock!)</span>}
                    </p>
                  </div>
                  
                  <div className="item-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleEditClick(inv)}
                      data-cy="edit-inventory-button"
                    >
                      Update Stock
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDeleteInventory(inv.itemId)}
                      data-cy="delete-inventory-button"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryManagement; 