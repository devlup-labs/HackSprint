import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import AuthProvider from "./providers/AuthProvider.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// Registered in dev too (not just PROD) — Web Push notifications need a
// registered service worker to receive them, and this app's dev workflow
// is testing directly against the running Vite dev server. The worker
// itself no-ops its offline-cache logic on the dev port (see
// service-worker.js), so this doesn't change dev-mode caching behavior.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });

  // Auto-reload-on-update is a production-only concern: it exists so a
  // visitor picks up a new deploy's hashed assets instead of running stale
  // JS against a changed API. In dev, the worker now registers every
  // session (see comment above) and its activate handler claims the page
  // immediately (`clients.claim()`), which fires this same event on the
  // very first registration — with this ungated, that meant an unprompted
  // full-page reload the moment the SW first activated, which looks like
  // the page "snapping open" and skips the app's normal loading state.
  // Vite's own HMR is what should handle updates in dev.
  if (import.meta.env.PROD) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }
}
