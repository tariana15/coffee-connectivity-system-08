
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import CashRegister from "./pages/CashRegister";
import RecipeCards from "./pages/RecipeCards";
import Schedule from "./pages/Schedule";
import Invoices from "./pages/Invoices";
import Chat from "./pages/Chat";
import Bonuses from "./pages/Bonuses";
import Salary from "./pages/Salary";
import NotFound from "./pages/NotFound";

// Setup QueryClient
const queryClient = new QueryClient();

// Ensure mobile-only layout
const MobileContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-md mx-auto border-x border-border min-h-screen bg-background">
      {children}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <MobileContainer>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/inventory" 
                  element={
                    <ProtectedRoute allowedRoles={["owner"]}>
                      <Inventory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <ProtectedRoute allowedRoles={["owner"]}>
                      <Analytics />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/cash-register" 
                  element={
                    <ProtectedRoute>
                      <CashRegister />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bonuses" 
                  element={
                    <ProtectedRoute>
                      <Bonuses />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/recipe-cards" 
                  element={
                    <ProtectedRoute>
                      <RecipeCards />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/schedule" 
                  element={
                    <ProtectedRoute>
                      <Schedule />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/invoices" 
                  element={
                    <ProtectedRoute>
                      <Invoices />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat" 
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/salary" 
                  element={
                    <ProtectedRoute allowedRoles={["owner"]}>
                      <Salary />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </MobileContainer>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
