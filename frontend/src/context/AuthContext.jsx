// AuthContext.jsx - Global Authentication State Management
// Provides login/logout state to all components via React Context
import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext(null);

// AuthProvider wraps the whole app to provide auth state everywhere
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if user already has a saved session
  useEffect(() => {
    const savedToken = localStorage.getItem('cureconnect_token');
    const savedUser = localStorage.getItem('cureconnect_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Called after successful login or register
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    // Save to localStorage so session persists on page refresh
    localStorage.setItem('cureconnect_token', authToken);
    localStorage.setItem('cureconnect_user', JSON.stringify(userData));
  };

  // Called on logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cureconnect_token');
    localStorage.removeItem('cureconnect_user');
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy usage: const { user, login, logout } = useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
