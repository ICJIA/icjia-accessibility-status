/**
 * @fileoverview AuthContext
 * Authentication context provider for managing user authentication state.
 * Handles login, logout, session management, and periodic session refresh.
 *
 * @module contexts/AuthContext
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import { api } from "../lib/api";

/**
 * Authentication context type
 * @typedef {Object} AuthContextType
 * @property {User|null} user - Currently authenticated user or null
 * @property {boolean} loading - Whether authentication is being checked
 * @property {Function} login - Login function
 * @property {Function} logout - Logout function
 * @property {Function} checkAuth - Check current authentication status
 * @property {Function} clearUser - Clear user from context
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 *
 * Provides authentication context to the application. Features:
 * - User session management
 * - Periodic session refresh (every 5 minutes)
 * - Login and logout functionality
 * - Authentication state tracking
 * - Automatic session expiration handling
 *
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {React.ReactElement} The provider component
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await api.auth.getSession();
      setUser(response.user);
    } catch (error) {
      // 401 is expected when user is not logged in - don't treat as error
      const err = error as Error & { status?: number };
      if (err.status !== 401) {
        console.error("Failed to check auth:", error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Set up periodic session refresh every 5 minutes
    // This ensures we catch expired sessions proactively
    const sessionRefreshInterval = setInterval(async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error("Session refresh failed:", error);
        // If refresh fails, clear user to force re-login
        setUser(null);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Clean up interval on unmount
    return () => clearInterval(sessionRefreshInterval);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await api.auth.login(username, password);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  const clearUser = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, checkAuth, clearUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 *
 * Custom hook to access authentication context. Must be used within AuthProvider.
 * Provides access to current user, loading state, and authentication functions.
 *
 * @function useAuth
 * @returns {AuthContextType} Authentication context with user, loading, and auth functions
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * const { user, loading, login, logout } = useAuth();
 *
 * @example
 * // Check if user is authenticated
 * const { user } = useAuth();
 * if (user) {
 *   // User is logged in
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
