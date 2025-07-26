import React, { useState } from 'react';
import api from '../services/api';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login', formData);
      const { token, user } = response.data;
      onLogin(user, token);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            disabled={loading}
            data-cy="username-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={loading}
            data-cy="password-input"
          />
        </div>

        {error && <div className="error" data-cy="error-message">{error}</div>}

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
          data-cy="login-button"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <p>Don't have an account?</p>
          <button 
            className="btn btn-secondary" 
            onClick={onSwitchToRegister}
            data-cy="switch-to-register-button"
          >
            Create Account
          </button>
        </div>
        
        <div style={{ fontSize: '14px', color: '#666' }}>
          <p><strong>Demo Accounts:</strong></p>
          <p>Username: admin, Password: password</p>
          <p>Username: user1, Password: user123</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 