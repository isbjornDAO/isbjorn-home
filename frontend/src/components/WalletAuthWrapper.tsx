import { useEffect, useCallback, useState, useRef } from 'react';
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
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const lastAuthenticatedAddress = useRef<string | null>(null);

  const authenticateWallet = useCallback(async (address: string) => {
    if (isAuthenticating) return;
    if (lastAuthenticatedAddress.current === address.toLowerCase()) return;

    setIsAuthenticating(true);

    try {
      // Create a simple message - no signature needed for basic wallet login
      const message = `Sign this message to authenticate with Isbjorn.\n\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}`;

      toast.loading('Authenticating wallet...', { id: 'wallet-auth' });

      // For thirdweb, we'll use a simplified auth - just send the address
      // The backend will create/find the user and return tokens
      const response = await apiService.post<{
        user: any;
        token: string;
        refreshToken: string;
      }>('/auth/wallet-login', {
        address,
        message,
        signature: 'thirdweb-auth', // Placeholder - backend should handle this gracefully
      });

      // Store token and user data
      localStorage.setItem('authToken', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      lastAuthenticatedAddress.current = address.toLowerCase();

      // Refresh auth state to update context
      await checkAuthStatus();

      toast.success('Wallet authenticated!', { id: 'wallet-auth' });
    } catch (error: any) {
      console.error('Wallet authentication error:', error);
      // Don't show error on network failures - wallet is still connected
      if (error?.response?.status !== 500 && error?.code !== 'ERR_NETWORK') {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to sync wallet';
        toast.error(errorMsg, { id: 'wallet-auth' });
      } else {
        toast.dismiss('wallet-auth');
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating, checkAuthStatus]);

  // Authenticate when wallet connects
  useEffect(() => {
    if (connectionStatus === 'connected' && activeAccount?.address && !isAuthenticated) {
      authenticateWallet(activeAccount.address);
    }
  }, [connectionStatus, activeAccount?.address, isAuthenticated, authenticateWallet]);

  // Reset when wallet disconnects
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      lastAuthenticatedAddress.current = null;
    }
  }, [connectionStatus]);

  return <>{children}</>;
};
