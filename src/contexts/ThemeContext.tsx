/**
 * @fileoverview ThemeContext
 * Theme context provider for managing light/dark mode state.
 * Applies theme classes to the document root for Tailwind CSS dark mode support.
 *
 * @module contexts/ThemeContext
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

/**
 * Theme context type
 * @typedef {Object} ThemeContextType
 * @property {boolean} isDark - Whether dark mode is enabled
 * @property {Function} toggleTheme - Function to toggle between light and dark mode
 */
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider Component
 *
 * Provides theme context to the application. Features:
 * - Light and dark mode support
 * - Automatic DOM class management for Tailwind CSS
 * - Theme state persistence (can be extended)
 * - Global theme toggle functionality
 *
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {React.ReactElement} The provider component
 *
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 *
 * Custom hook to access theme context. Must be used within ThemeProvider.
 * Provides access to current theme state and toggle function.
 *
 * @function useTheme
 * @returns {ThemeContextType} Theme context with isDark and toggleTheme
 * @throws {Error} If used outside of ThemeProvider
 *
 * @example
 * const { isDark, toggleTheme } = useTheme();
 *
 * @example
 * // Toggle dark mode
 * const { toggleTheme } = useTheme();
 * toggleTheme();
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
