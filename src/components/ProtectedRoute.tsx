/**
 * @fileoverview ProtectedRoute Component
 * Route wrapper that enforces authentication and password change requirements.
 * Redirects unauthenticated users to login and forces password changes when needed.
 *
 * @module components/ProtectedRoute
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication. Provides the following protections:
 * - Redirects unauthenticated users to the login page
 * - Shows a loading spinner while authentication is being verified
 * - Forces users to change their password if required
 * - Allows authenticated users to access the protected content
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to render if user is authenticated
 * @returns {React.ReactElement} Loading spinner, redirect, or protected content
 *
 * @example
 * // Protect a route
 * <Route
 *   path="/admin"
 *   element={
 *     <ProtectedRoute>
 *       <AdminDashboard />
 *     </ProtectedRoute>
 *   }
 * />
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user must change password and is not already on the change password page, redirect
  if (user.must_change_password && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
}
