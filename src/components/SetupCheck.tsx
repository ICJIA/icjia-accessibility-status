/**
 * @fileoverview SetupCheck Component
 * Wrapper component that checks if initial setup is needed and redirects to setup page if required.
 *
 * @module components/SetupCheck
 */

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";

/**
 * SetupCheck Component
 *
 * Checks if the application needs initial setup (e.g., admin user creation).
 * If setup is needed, redirects to the setup page. Otherwise, renders children.
 * Shows a loading spinner while checking setup status.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render if setup is complete
 * @returns {React.ReactElement} Loading spinner or children
 *
 * @example
 * <SetupCheck>
 *   <App />
 * </SetupCheck>
 */
export function SetupCheck({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSetup = async () => {
      try {
        // Don't check if we're already on the setup page
        if (location.pathname === "/setup") {
          setChecking(false);
          return;
        }

        const response = await api.auth.needsSetup();

        if (response.needsSetup) {
          // Redirect to setup page if initial setup is needed
          navigate("/setup", { replace: true });
        }
      } catch (error) {
        console.error("Error checking setup status:", error);
        // On error, continue to app (fail open)
      } finally {
        setChecking(false);
      }
    };

    checkSetup();
  }, [navigate, location.pathname]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
