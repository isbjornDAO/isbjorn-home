import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThirdwebProvider } from 'thirdweb/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { BlockchainProvider } from '@/contexts/BlockchainContext';
import { WalletAuthWrapper } from '@/components/WalletAuthWrapper';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';

const HomePage = lazy(() => import('@/pages/HomePage'));
const DonatePage = lazy(() => import('@/pages/DonatePage'));
const StreamlinedDonatePage = lazy(() => import('@/pages/StreamlinedDonatePage'));
const SimpleDonatePage = lazy(() => import('@/pages/SimpleDonatePage'));
const DonationSuccessPage = lazy(() => import('@/pages/DonationSuccessPage'));
const ComplianceDashboardPage = lazy(() => import('@/pages/ComplianceDashboardPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const ReceiptPage = lazy(() => import('@/pages/ReceiptPage'));
const CharityDetailsPage = lazy(() => import('@/pages/CharityDetailsPage'));
const IntegrationsPage = lazy(() => import('@/pages/IntegrationsPage'));
const SystemStatusPage = lazy(() => import('@/pages/SystemStatusPage'));
const BusinessDashboard = lazy(() => import('@/pages/BusinessDashboard'));
const WalletPage = lazy(() => import('@/pages/WalletPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const DonationForm = lazy(() => import('@/components/DonationForm'));
const MapPage = lazy(() => import('@/pages/MapPage'));
const LiveCamsPage = lazy(() => import('@/pages/LiveCamsPage'));
const VotePage = lazy(() => import('@/pages/VotePage'));
const TestSvalbardPage = lazy(() => import('@/pages/TestSvalbardPage'));

function App() {
  return (
    <ThirdwebProvider>
      <AuthProvider>
        <BlockchainProvider>
          <WalletAuthWrapper>
            <Layout>
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />

                  <Route path="/donate" element={<DonatePage />} />

                  {/* Advanced Donation Flows */}
                  <Route path="/donate-streamlined" element={<StreamlinedDonatePage />} />
                  <Route path="/donate-simple" element={<SimpleDonatePage />} />
                  <Route path="/donation/success" element={<DonationSuccessPage />} />
                  <Route path="/compliance" element={<ComplianceDashboardPage />} />
                  {/* Redirect old Isbjorn URL to new PBI URL */}
                  <Route path="/charity/isbjorn" element={<Navigate to="/charity/pbi" replace />} />
                  <Route path="/charity/:id" element={<CharityDetailsPage />} />
                  <Route path="/system-status" element={<SystemStatusPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/live" element={<LiveCamsPage />} />
                  <Route path="/vote" element={<VotePage />} />
                  <Route path="/test-svalbard" element={<TestSvalbardPage />} />
                  {/* Legacy redirect */}
                  <Route path="/node" element={<Navigate to="/vote" replace />} />

                  {/* Business Portal */}
                  <Route path="/business-dashboard" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />
                  <Route path="/donate-business" element={<DonationForm />} />

                  {/* Auth routes removed - using thirdweb ConnectButton in navbar */}
                  <Route path="/login" element={<Navigate to="/" replace />} />
                  <Route path="/signup" element={<Navigate to="/" replace />} />
                  <Route path="/register" element={<Navigate to="/" replace />} />
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
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/shop"
                    element={
                      <ProtectedRoute>
                        <ShopPage />
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
          </WalletAuthWrapper>
        </BlockchainProvider>
      </AuthProvider>
    </ThirdwebProvider>
  );
}

export default App;