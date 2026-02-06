import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Analytics from "./pages/Analytics";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import MultiBot from "./pages/MultiBot";
import FlowBuilderPro from "./pages/FlowBuilderPro";
import Users from "./pages/Users";
import { PermissionRoute } from "./components/PermissionRoute";
import { PERMISSIONS } from "@/constants/common";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} />
    <BrowserRouter basename="/dashboard_webhook">
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <PermissionRoute permission={PERMISSIONS.ANALYTICS}>
                    <Analytics />
                  </PermissionRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <PermissionRoute permission={PERMISSIONS.MANAGE_CLIENTS}>
                    <Clients />
                  </PermissionRoute>
                }
              />
              <Route
                path="/multibot"
                element={
                  <PermissionRoute permission={PERMISSIONS.MANAGE_MULTIBOT}>
                    <MultiBot />
                  </PermissionRoute>
                }
              />
              <Route
                path="/flow-builder"
                element={
                  <PermissionRoute permission={PERMISSIONS.FLOW_BUILDER}>
                    <FlowBuilderPro />
                  </PermissionRoute>
                }
              />
              <Route
                path="/flow-builder/:id"
                element={
                  <PermissionRoute permission={PERMISSIONS.FLOW_BUILDER}>
                    <FlowBuilderPro />
                  </PermissionRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <PermissionRoute permission={PERMISSIONS.MANAGE_USERS}>
                    <Users />
                  </PermissionRoute>
                }
              />
              {/* <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              /> */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
