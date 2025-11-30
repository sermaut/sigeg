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
import { PerformanceMonitor } from '@/components/common/PerformanceMonitor';
import { GlobalPageLoader } from '@/components/common/GlobalPageLoader';
import { PWAUpdatePrompt } from '@/components/common/PWAUpdatePrompt';
import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt';
import { OfflineIndicator } from '@/components/common/OfflineIndicator';
import '@/i18n';

// CRITICAL: Import Index and Auth directly (no lazy loading) for faster login
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';

// Lazy load other pages for code splitting
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
const SheetMusic = lazy(() => import('@/pages/SheetMusic'));
const AdminManagement = lazy(() => import('@/pages/AdminManagement'));
const Contact = lazy(() => import('@/pages/Contact'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// ULTRA-FAST: Cache otimizado para máxima performance (<1s loading)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Dados nunca ficam stale automaticamente
      gcTime: Infinity, // Mantém em cache indefinidamente
      retry: false, // Sem retry para máxima velocidade
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      networkMode: 'offlineFirst', // Usa cache primeiro, sempre
    },
    mutations: {
      retry: false,
      networkMode: 'offlineFirst',
    },
  },
});


function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <PWAUpdatePrompt />
            <PWAInstallPrompt />
            <OfflineIndicator />
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <GlobalErrorToast />
                <PerformanceMonitor />
                
                <Suspense fallback={<GlobalPageLoader />}>
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
                      path="/sheet-music"
                      element={
                        <ProtectedRoute permission="view_group_data">
                          <SheetMusic />
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
                    
                    <Route
                      path="/contact"
                      element={
                        <ProtectedRoute>
                          <Contact />
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