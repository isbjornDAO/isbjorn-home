import { useEffect, useCallback, useRef } from 'react';
import { useActiveAccount, useActiveWalletConnectionStatus } from 'thirdweb/react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

/**
 * This component handles automatic wallet authentication when a wallet is connected via thirdweb.
 * It syncs the thirdweb wallet connection with the backend to create/login user accounts.
 */
export const WalletAuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const activeAccount = useActiveAccount();
  const connectionStatus = useActiveWalletConnectionStatus();
  const { isAuthenticated, checkAuthStatus } = useAuth();

  // Use refs to prevent multiple calls and track state across renders
  const isAuthenticatingRef = useRef(false);
  const lastAuthenticatedAddressRef = useRef<string | null>(null);
  const hasAttemptedRef = useRef(false);

  const authenticateWallet = useCallback(async (address: string) => {
    // Prevent multiple simultaneous requests
    if (isAuthenticatingRef.current) return;

    // Don't re-authenticate the same address
    const normalizedAddress = address.toLowerCase();
    if (lastAuthenticatedAddressRef.current === normalizedAddress) return;

    // Only attempt once per session
    if (hasAttemptedRef.current) return;

    isAuthenticatingRef.current = true;
    hasAttemptedRef.current = true;

    try {
      const message = `Sign this message to authenticate with Isbjorn.\n\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}`;

      toast.loading('Authenticating wallet...', { id: 'wallet-auth' });

      const response = await apiService.post<{
        user: any;
        token: string;
        refreshToken: string;
      }>('/auth/wallet-login', {
        address,
        message,
        signature: 'thirdweb-auth',
      });

      // Store token and user data
      localStorage.setItem('authToken', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      lastAuthenticatedAddressRef.current = normalizedAddress;

      // Refresh auth state to update context
      await checkAuthStatus();

      toast.success('Wallet authenticated!', { id: 'wallet-auth' });
    } catch (error: any) {
      console.error('Wallet authentication error:', error);
      // Silently dismiss on errors - don't spam user with errors
      toast.dismiss('wallet-auth');
    } finally {
      isAuthenticatingRef.current = false;
    }
  }, [checkAuthStatus]);

  // Authenticate when wallet connects (only once)
  useEffect(() => {
    if (connectionStatus === 'connected' && activeAccount?.address && !isAuthenticated && !hasAttemptedRef.current) {
      authenticateWallet(activeAccount.address);
    }
  }, [connectionStatus, activeAccount?.address, isAuthenticated, authenticateWallet]);

  // Reset when wallet disconnects
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      lastAuthenticatedAddressRef.current = null;
      hasAttemptedRef.current = false;
    }
  }, [connectionStatus]);

  return <>{children}</>;
};
