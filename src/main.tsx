/**
 * @fileoverview Application Entry Point
 * React application entry point that mounts the App component to the DOM.
 * Initializes React 18 with StrictMode for development checks.
 *
 * @module main
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Debug: Track page reloads
console.log("[App Init] Application starting at", new Date().toISOString());

// Track all navigation events
window.addEventListener("beforeunload", () => {
  console.error(
    "[CRITICAL] Page is being unloaded/reloaded at",
    new Date().toISOString()
  );
  console.trace("[CRITICAL] Stack trace of reload:");
});

// Track all fetch requests to see if any are causing redirects
const originalFetch = window.fetch;
window.fetch = function (...args: any[]) {
  const [resource] = args;
  console.log(`[Fetch] ${resource}`);
  return originalFetch.apply(this, args).then((response) => {
    if (response.status >= 300 && response.status < 400) {
      console.warn(
        `[Fetch] Redirect detected: ${response.status} from ${resource}`
      );
    }
    return response;
  });
};

/**
 * Mount the React application to the DOM
 *
 * - Uses React 18 createRoot API
 * - Wraps App in StrictMode for development checks
 * - Mounts to element with id 'root'
 * - Loads global styles from index.css
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
