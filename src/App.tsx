import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { GlobalErrorToast } from '@/components/common/GlobalErrorToast';
import { StatsSkeleton } from '@/components/common/LoadingSkeleton';
import '@/i18n';

// Lazy load pages for code splitting
const Index = lazy(() => import('@/pages/Index'));
const Auth = lazy(() => import('@/pages/Auth'));
const Groups = lazy(() => import('@/pages/Groups'));
const NewGroup = lazy(() => import('@/pages/NewGroup'));
const EditGroup = lazy(() => import('@/pages/EditGroup'));
const GroupDetails = lazy(() => import('@/pages/GroupDetails'));
const NewMember = lazy(() => import('@/pages/NewMember'));
const EditMember = lazy(() => import('@/pages/EditMember'));
const MemberDetails = lazy(() => import('@/pages/MemberDetails'));
const ReportsPage = lazy(() => import('@/components/reports/ReportsPage'));
const ServicesPage = lazy(() => import('@/components/services/ServicesPage'));
const MonthlyPlans = lazy(() => import('@/pages/MonthlyPlans'));
const AdminManagement = lazy(() => import('@/pages/AdminManagement'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Create React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes (otimizado)
      gcTime: 30 * 60 * 1000, // 30 minutes (otimizado)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.message?.includes('4')) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-6xl p-6">
        <StatsSkeleton />
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <GlobalErrorToast />
                
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    
                    {/* Protected Routes */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/groups"
                      element={
                        <ProtectedRoute permission="view_group_data">
                          <Groups />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/groups/new"
                      element={
                        <ProtectedRoute permission="manage_groups">
                          <NewGroup />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/groups/:id/edit"
                      element={
                        <ProtectedRoute permission="manage_groups">
                          <EditGroup />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/groups/:id"
                      element={
                        <ProtectedRoute permission="view_group_data">
                          <GroupDetails />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/members/new"
                      element={
                        <ProtectedRoute permission="manage_group_members">
                          <NewMember />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/members/:id/edit"
                      element={
                        <ProtectedRoute permission="manage_group_members">
                          <EditMember />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/members/:id"
                      element={
                        <ProtectedRoute permission="view_group_data">
                          <MemberDetails />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/reports"
                      element={
                        <ProtectedRoute permission="view_group_data">
                          <ReportsPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/services"
                      element={
                        <ProtectedRoute permission="view_group_data">
                          <ServicesPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/plans"
                      element={
                        <ProtectedRoute permission="view_group_data">
                          <MonthlyPlans />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/plans/:groupId"
                      element={
                        <ProtectedRoute permission="manage_groups">
                          <MonthlyPlans />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute permission="manage_admins">
                          <AdminManagement />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                
                <Toaster />
                <Sonner />
              </div>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
        
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;