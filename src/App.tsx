import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import CashRegister from "./pages/CashRegister";
import RecipeCards from "./pages/RecipeCards";
import Schedule from "./pages/Schedule";
import NotFound from "./pages/NotFound";
import Invoices from "./pages/Invoices";
import Bonuses from "./pages/Bonuses";
import Salary from "./pages/Salary";
// import Chat from "./pages/Chat";
import Index from "./pages/Index";
import SalesAnalytics from "./pages/SalesAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Перенаправление с корневого пути на /index для правильной загрузки в мобильном приложении */}
              <Route path="/" element={<Navigate to="/index" replace />} />
              <Route path="/index" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventory" 
                element={
                  <ProtectedRoute allowedRoles={["owner", "manager"]}>
                    <Inventory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute allowedRoles={["owner", "manager"]}>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sales-analytics" 
                element={
                  <ProtectedRoute>
                    <SalesAnalytics />
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
                path="/bonuses" 
                element={
                  <ProtectedRoute>
                    <Bonuses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/salary" 
                element={
                  <ProtectedRoute>
                    <Salary />
                  </ProtectedRoute>
                } 
              />
              {/* <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } 
              /> */}
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
