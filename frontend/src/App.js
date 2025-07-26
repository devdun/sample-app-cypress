import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import TodoApp from './components/TodoApp';
import api from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState('');

  useEffect(() => {
    // Check if user is already logged in (token in localStorage)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const handleRegister = (message) => {
    setRegistrationSuccess(message);
    setShowRegister(false);
  };

  const handleSwitchToRegister = () => {
    setShowRegister(true);
    setRegistrationSuccess('');
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
  };

  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <TodoApp user={user} onLogout={handleLogout} />
      ) : (
        <>
          {registrationSuccess && (
            <div style={{ 
              maxWidth: '400px', 
              margin: '20px auto', 
              padding: '15px', 
              backgroundColor: '#d4edda', 
              color: '#155724', 
              border: '1px solid #c3e6cb', 
              borderRadius: '5px',
              textAlign: 'center'
            }}>
              {registrationSuccess} Please login with your new account.
            </div>
          )}
          
          {showRegister ? (
            <Register 
              onRegister={handleRegister} 
              onSwitchToLogin={handleSwitchToLogin} 
            />
          ) : (
            <Login 
              onLogin={handleLogin} 
              onSwitchToRegister={handleSwitchToRegister} 
            />
          )}
        </>
      )}
    </div>
  );
}

export default App; 