import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { BlockchainProvider } from '@/contexts/BlockchainContext';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';

const HomePage = lazy(() => import('@/pages/HomePage'));
const DonatePage = lazy(() => import('@/pages/DonatePage'));
const StreamlinedDonatePage = lazy(() => import('@/pages/StreamlinedDonatePage'));
const DonationSuccessPage = lazy(() => import('@/pages/DonationSuccessPage'));
const ComplianceDashboardPage = lazy(() => import('@/pages/ComplianceDashboardPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ReceiptPage = lazy(() => import('@/pages/ReceiptPage'));
const CharityDetailsPage = lazy(() => import('@/pages/CharityDetailsPage'));
const IntegrationsPage = lazy(() => import('@/pages/IntegrationsPage'));
const SystemStatusPage = lazy(() => import('@/pages/SystemStatusPage'));
const BusinessDashboard = lazy(() => import('@/pages/BusinessDashboard'));
const WalletPage = lazy(() => import('@/pages/WalletPage'));
const DonationForm = lazy(() => import('@/components/DonationForm'));

function App() {
  return (
    <AuthProvider>
      <BlockchainProvider>
        <Layout>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              <Route path="/" element={<HomePage />} />

              <Route path="/donate" element={<DonatePage />} />

              {/* Advanced Donation Flows */}
              <Route path="/donate-streamlined" element={<StreamlinedDonatePage />} />
              <Route path="/donation/success" element={<DonationSuccessPage />} />
              <Route path="/compliance" element={<ComplianceDashboardPage />} />
              <Route path="/charity/:id" element={<CharityDetailsPage />} />
              <Route path="/system-status" element={<SystemStatusPage />} />

              {/* Business Portal */}
              <Route path="/business-dashboard" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />
              <Route path="/donate-business" element={<DonationForm />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/integrations"
                element={
                  <ProtectedRoute>
                    <IntegrationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <WalletPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receipt/:id"
                element={
                  <ProtectedRoute>
                    <ReceiptPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </BlockchainProvider>
    </AuthProvider>
  );
}

export default App;