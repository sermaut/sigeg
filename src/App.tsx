import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";
import EditGroup from "./pages/EditGroup";
import EditMember from "./pages/EditMember";
import NewGroup from "./pages/NewGroup";
import NewMember from "./pages/NewMember";
import MemberDetails from "./pages/MemberDetails";
import AdminManagement from "./pages/AdminManagement";
import ReportsPage from "./components/reports/ReportsPage";
import ServicesPage from "./components/services/ServicesPage";
import MonthlyPlans from "./pages/MonthlyPlans";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/groups" element={
              <ProtectedRoute permission="view_group_data">
                <Groups />
              </ProtectedRoute>
            } />
            <Route path="/groups/new" element={
              <ProtectedRoute permission="manage_groups">
                <NewGroup />
              </ProtectedRoute>
            } />
            <Route path="/groups/:id" element={
              <ProtectedRoute permission="view_group_data">
                <GroupDetails />
              </ProtectedRoute>
            } />
            <Route path="/groups/:id/edit" element={
              <ProtectedRoute permission="manage_groups">
                <EditGroup />
              </ProtectedRoute>
            } />
            <Route path="/members/new" element={
              <ProtectedRoute permission="manage_group_members">
                <NewMember />
              </ProtectedRoute>
            } />
            <Route path="/members/:id/edit" element={
              <ProtectedRoute permission="manage_group_members">
                <EditMember />
              </ProtectedRoute>
            } />
            <Route path="/members/:id" element={
              <ProtectedRoute permission="view_group_data">
                <MemberDetails />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute permission="manage_admins">
                <AdminManagement />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute permission="view_group_data">
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/services" element={
              <ProtectedRoute permission="view_group_data">
                <ServicesPage />
              </ProtectedRoute>
            } />
            <Route path="/plans" element={
              <ProtectedRoute permission="view_group_data">
                <MonthlyPlans />
              </ProtectedRoute>
            } />
            <Route path="/plans/:groupId" element={
              <ProtectedRoute permission="manage_groups">
                <MonthlyPlans />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
