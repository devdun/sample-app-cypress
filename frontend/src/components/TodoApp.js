import React, { useState, useEffect } from 'react';
import api from '../services/api';
import InventoryManagement from './InventoryManagement';
import OrderManagement from './OrderManagement';

const TodoApp = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [newItem, setNewItem] = useState({ title: '', description: '' });
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/items');
      setItems(response.data);
      setError('');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch items';
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

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.title.trim()) {
      showMessage('Title is required', 'error');
      return;
    }

    try {
      const response = await api.post('/items', newItem);
      setItems([...items, response.data]);
      setNewItem({ title: '', description: '' });
      showMessage('Item added successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add item';
      showMessage(errorMessage, 'error');
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item.id);
    setEditForm({ title: item.title, description: item.description });
  };

  const handleEditCancel = () => {
    setEditingItem(null);
    setEditForm({ title: '', description: '' });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editForm.title.trim()) {
      showMessage('Title is required', 'error');
      return;
    }

    try {
      const response = await api.put(`/items/${editingItem}`, editForm);
      setItems(items.map(item => 
        item.id === editingItem ? response.data : item
      ));
      setEditingItem(null);
      setEditForm({ title: '', description: '' });
      showMessage('Item updated successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update item';
      showMessage(errorMessage, 'error');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await api.delete(`/items/${itemId}`);
      setItems(items.filter(item => item.id !== itemId));
      showMessage('Item deleted successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete item';
      showMessage(errorMessage, 'error');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'items':
        return renderItemsSection();
      case 'inventory':
        return <InventoryManagement />;
      case 'orders':
        return <OrderManagement />;
      default:
        return renderItemsSection();
    }
  };

  const renderItemsSection = () => (
    <>
      {/* Messages */}
      {error && <div className="error" data-cy="error-message">{error}</div>}
      {success && <div className="success" data-cy="success-message">{success}</div>}

      {/* Add New Item Form */}
      <div className="add-item-form">
        <h3>Add New Item</h3>
        <form onSubmit={handleAddItem}>
          <div className="form-group">
            <label htmlFor="new-title">Title *</label>
            <input
              type="text"
              id="new-title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              placeholder="Enter item title"
              data-cy="new-item-title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="new-description">Description</label>
            <textarea
              id="new-description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Enter item description (optional)"
              data-cy="new-item-description"
            />
          </div>

          <button type="submit" className="btn btn-primary" data-cy="add-item-button">
            Add Item
          </button>
        </form>
      </div>

      {/* Items List */}
      <div className="items-list">
        <h3>Your Items ({items.length})</h3>
        
        {loading ? (
          <div className="loading">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="no-items">
            No items yet. Add your first item above!
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="item" data-cy="item">
              {editingItem === item.id ? (
                // Edit Form
                <form onSubmit={handleEditSubmit} style={{ width: '100%' }}>
                  <div className="form-group">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Enter item title"
                      data-cy="edit-item-title"
                    />
                  </div>
                  
                  <div className="form-group">
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Enter item description"
                      data-cy="edit-item-description"
                    />
                  </div>

                  <div className="item-actions">
                    <button type="submit" className="btn btn-primary" data-cy="save-item-button">
                      Save
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={handleEditCancel}
                      data-cy="cancel-edit-button"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Display Item
                <>
                  <div className="item-content">
                    <h4 data-cy="item-title">{item.title}</h4>
                    {item.description && (
                      <p data-cy="item-description">{item.description}</p>
                    )}
                  </div>
                  
                  <div className="item-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleEditClick(item)}
                      data-cy="edit-item-button"
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDeleteItem(item.id)}
                      data-cy="delete-item-button"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>Inventory Management System</h1>
        <div className="user-info">
          <span>Welcome, {user.username}!</span>
          <button className="btn btn-secondary" onClick={onLogout} data-cy="logout-button">
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          padding: '20px', 
          background: 'white', 
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
          <button 
            className={`btn ${activeTab === 'items' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('items')}
            data-cy="items-tab"
          >
            📦 Items
          </button>
          <button 
            className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('inventory')}
            data-cy="inventory-tab"
          >
            📊 Inventory
          </button>
          <button 
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('orders')}
            data-cy="orders-tab"
          >
            🛒 Orders
          </button>
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default TodoApp; 