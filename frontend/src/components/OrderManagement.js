import React, { useState, useEffect } from 'react';
import api from '../services/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, inventoryResponse] = await Promise.all([
        api.get('/orders'),
        api.get('/inventory')
      ]);
      setOrders(ordersResponse.data);
      setInventory(inventoryResponse.data);
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

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    if (!selectedItemId || quantity === '') {
      showMessage('Please select an item and enter quantity', 'error');
      return;
    }

    if (parseInt(quantity) <= 0) {
      showMessage('Quantity must be greater than 0', 'error');
      return;
    }

    try {
      await api.post('/orders', {
        itemId: parseInt(selectedItemId),
        quantity: parseInt(quantity)
      });
      
      // Refresh data to get updated inventory and orders
      await fetchData();
      setSelectedItemId('');
      setQuantity('');
      showMessage('Order created successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create order';
      showMessage(errorMessage, 'error');
    }
  };

  const handleEditClick = (order) => {
    setEditingOrder(order.id);
    setEditQuantity(order.quantity.toString());
    setEditStatus(order.status);
  };

  const handleEditCancel = () => {
    setEditingOrder(null);
    setEditQuantity('');
    setEditStatus('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const updateData = {};
    const originalOrder = orders.find(o => o.id === editingOrder);
    
    if (editQuantity !== originalOrder.quantity.toString()) {
      if (parseInt(editQuantity) <= 0) {
        showMessage('Quantity must be greater than 0', 'error');
        return;
      }
      updateData.quantity = parseInt(editQuantity);
    }
    
    if (editStatus !== originalOrder.status) {
      updateData.status = editStatus;
    }

    if (Object.keys(updateData).length === 0) {
      handleEditCancel();
      return;
    }

    try {
      const response = await api.put(`/orders/${editingOrder}`, updateData);
      
      setOrders(orders.map(order => 
        order.id === editingOrder ? { ...order, ...response.data } : order
      ));
      
      // Refresh inventory data as it might have changed
      const inventoryResponse = await api.get('/inventory');
      setInventory(inventoryResponse.data);
      
      setEditingOrder(null);
      setEditQuantity('');
      setEditStatus('');
      showMessage('Order updated successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update order';
      showMessage(errorMessage, 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);
      setOrders(orders.filter(order => order.id !== orderId));
      
      // Refresh inventory data as it might have changed
      const inventoryResponse = await api.get('/inventory');
      setInventory(inventoryResponse.data);
      
      showMessage('Order cancelled successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to cancel order';
      showMessage(errorMessage, 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Get items that are in inventory and available for ordering
  const availableInventory = inventory.filter(inv => inv.quantity > 0);

  return (
    <div className="container">
      <h2>Order Management</h2>

      {/* Messages */}
      {error && <div className="error" data-cy="orders-error-message">{error}</div>}
      {success && <div className="success" data-cy="orders-success-message">{success}</div>}

      {/* Create New Order Form */}
      <div className="add-item-form">
        <h3>Create New Order</h3>
        <form onSubmit={handleCreateOrder}>
          <div className="form-group">
            <label htmlFor="item-select">Select Item</label>
            <select
              id="item-select"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              data-cy="order-item-select"
            >
              <option value="">Choose an item...</option>
              {availableInventory.map(inv => (
                <option key={inv.itemId} value={inv.itemId}>
                  {inv.item?.title} (Stock: {inv.quantity})
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
              min="1"
              max={selectedItemId ? inventory.find(inv => inv.itemId === parseInt(selectedItemId))?.quantity || 0 : undefined}
              data-cy="order-quantity-input"
            />
            {selectedItemId && (
              <small style={{ color: '#666' }}>
                Available: {inventory.find(inv => inv.itemId === parseInt(selectedItemId))?.quantity || 0} units
              </small>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!selectedItemId || quantity === '' || availableInventory.length === 0}
            data-cy="create-order-button"
          >
            Create Order
          </button>
        </form>
        
        {availableInventory.length === 0 && (
          <p style={{ color: '#dc3545', marginTop: '10px' }}>
            No items available in inventory. Please add stock first.
          </p>
        )}
      </div>

      {/* Orders List */}
      <div className="items-list">
        <h3>Your Orders ({orders.length})</h3>
        
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="no-items">
            No orders yet. Create your first order above!
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="item" data-cy="order-item">
              {editingOrder === order.id ? (
                // Edit Form
                <form onSubmit={handleEditSubmit} style={{ width: '100%' }}>
                  <div className="item-content">
                    <h4>Order #{order.id} - {order.item?.title}</h4>
                    <p>{order.item?.description}</p>
                    
                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label>Quantity:</label>
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        min="1"
                        data-cy="edit-order-quantity"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Status:</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        data-cy="edit-order-status"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="item-actions">
                    <button type="submit" className="btn btn-primary" data-cy="save-order-button">
                      Save
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={handleEditCancel}
                      data-cy="cancel-order-edit-button"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Display Order
                <>
                  <div className="item-content">
                    <h4 data-cy="order-title">Order #{order.id} - {order.item?.title}</h4>
                    <p data-cy="order-description">{order.item?.description}</p>
                    <p><strong>Quantity:</strong> <span data-cy="order-quantity">{order.quantity}</span> units</p>
                    <p>
                      <strong>Status:</strong> 
                      <span 
                        style={{ 
                          color: getStatusColor(order.status), 
                          fontWeight: 'bold',
                          textTransform: 'capitalize',
                          marginLeft: '5px'
                        }}
                        data-cy="order-status"
                      >
                        {order.status}
                      </span>
                    </p>
                  </div>
                  
                  <div className="item-actions">
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleEditClick(order)}
                        data-cy="edit-order-button"
                      >
                        Edit Order
                      </button>
                    )}
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleCancelOrder(order.id)}
                        data-cy="cancel-order-button"
                      >
                        Cancel Order
                      </button>
                    )}
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

export default OrderManagement; 