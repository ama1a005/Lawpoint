import { createContext, useContext, useState, useEffect } from 'react';
import { saveToken, getToken, removeToken } from '../utils/tokenStorage';

export const AuthContext = createContext(null);

/**
 * Decodes the JWT payload (middle segment) without a library.
 * Returns the parsed JSON object { userId, name, email, role, ... }
 */
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    // atob decodes base64 — handle URL-safe base64 characters
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check localStorage for an existing token
  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      const decoded = decodeToken(storedToken);
      if (decoded) {
        // Check if token is expired
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
          // Token expired — clear it
          removeToken();
        } else {
          setToken(storedToken);
          setUser({
            userId: decoded.userId || decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
          });
        }
      } else {
        // Invalid token — clear it
        removeToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken) => {
    saveToken(newToken);
    setToken(newToken);
    const decoded = decodeToken(newToken);
    if (decoded) {
      setUser({
        userId: decoded.userId || decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      });
    }
  };

  const logout = () => {
    removeToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context.
 * Must be used within an <AuthProvider>.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
