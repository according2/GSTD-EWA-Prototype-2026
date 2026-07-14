/**
 * EWA 3.0 2026 — Enterprise UI Prototype
 * Design: Neobrutalist Fintech | Primary: Deep Navy (#100841) | Accent: Teal (#31d891)
 * Command Center Layout | Role-Based View Switching | 18 Enterprise Modules
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ViewProvider } from "./contexts/ViewContext";
import { PortalLayout } from "./layouts/PortalLayout";

function AppRouter() {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

  return (
    <Router base={base}>
      <Switch>
        <Route path={"/"} component={PortalLayout} />
        <Route path={"/module/:module"} component={PortalLayout} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <ViewProvider>
          <TooltipProvider>
            <Toaster />
            <AppRouter />
          </TooltipProvider>
        </ViewProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
