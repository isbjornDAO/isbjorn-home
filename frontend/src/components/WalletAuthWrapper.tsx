import { useEffect, useCallback, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * This component handles automatic wallet authentication when a wallet is connected.
 * It runs at the app level to ensure users are authenticated if their wallet is connected.
 */
export const WalletAuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected, connector } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { isAuthenticated, checkAuthStatus, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  const authenticateWallet = useCallback(async () => {
    // Add more safety checks
    if (!address || !connector || isAuthenticating || hasAttempted) return;

    setIsAuthenticating(true);
    setHasAttempted(true);

    try {
      // Create message to sign
      const message = `Sign this message to authenticate with Isbjorn.\n\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}`;

      toast.loading('Please sign the message in your wallet...', { id: 'wallet-auth' });

      // Request signature
      const signature = await signMessageAsync({ message });

      toast.loading('Authenticating...', { id: 'wallet-auth' });

      // Send to backend for verification and authentication
      const response = await apiService.post<{
        user: any;
        token: string;
        refreshToken: string;
      }>('/auth/wallet-login', {
        address,
        message,
        signature,
      });

      // Store token and user data
      localStorage.setItem('authToken', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      // Refresh auth state to update context
      await checkAuthStatus();

      toast.success('Wallet authenticated successfully!', { id: 'wallet-auth' });

      // Only navigate if on login/signup pages
      if (location.pathname === '/login' || location.pathname === '/signup') {
        navigate('/profile', { replace: true });
      }
    } catch (error: any) {
      console.error('Wallet authentication error:', error);
      setIsAuthenticating(false);
      setHasAttempted(false);

      if (error.message?.includes('User rejected') || error.message?.includes('rejected')) {
        toast.error('Signature rejected', { id: 'wallet-auth' });
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to authenticate with wallet';
        toast.error(errorMsg, { id: 'wallet-auth' });
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, connector, isAuthenticating, hasAttempted, signMessageAsync, checkAuthStatus, navigate, location.pathname]);

  // Do NOT auto-authenticate - only authenticate when user explicitly clicks "Connect Wallet"
  // This component is just a wrapper that provides the authenticateWallet function
  // The LoginPage will call openConnectModal which triggers wallet connection
  // Then we handle the authentication after successful connection via window event

  // Reset hasAttempted when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setHasAttempted(false);
    }
  }, [isConnected]);

  return <>{children}</>;
};
