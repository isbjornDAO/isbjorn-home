import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

/**
 * OAuth Callback Page
 * Handles the redirect from OAuth providers (Google, Twitter, etc.)
 * Extracts tokens from URL and logs the user in
 */
const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get tokens from URL
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');

        // Check for errors
        if (error) {
          setStatus('error');
          setMessage(getErrorMessage(error));
          toast.error(getErrorMessage(error));
          setTimeout(() => navigate('/register'), 3000);
          return;
        }

        // Validate tokens
        if (!token || !refreshToken) {
          setStatus('error');
          setMessage('Authentication failed: Missing tokens');
          toast.error('Authentication failed');
          setTimeout(() => navigate('/register'), 3000);
          return;
        }

        // Store tokens
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);

        // Fetch user data
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const user = await response.json();
        updateUser(user);

        setStatus('success');
        setMessage(`Successfully authenticated with ${provider}!`);
        toast.success(`Welcome back, ${user.companyName}!`);

        // Redirect to dashboard
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');
        toast.error('Authentication failed');
        setTimeout(() => navigate('/register'), 3000);
      }
    };

    processAuth();
  }, [searchParams, navigate, updateUser]);

  const getErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'google_auth_failed': 'Google authentication failed. Please try again.',
      'twitter_auth_failed': 'X (Twitter) authentication failed. Please try again.',
      'token_generation_failed': 'Failed to generate authentication tokens. Please try again.',
      'access_denied': 'Access was denied. Please try again.',
    };

    return errorMessages[error] || 'Authentication failed. Please try again.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ice-50 to-arctic-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl border border-ice-200 p-8 text-center">
          {status === 'loading' && (
            <>
              <LoadingSpinner />
              <h2 className="text-2xl font-bold text-arctic-900 mt-6 mb-2">
                Authenticating...
              </h2>
              <p className="text-ice-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-arctic-900 mb-2">
                Success!
              </h2>
              <p className="text-ice-600">{message}</p>
              <p className="text-sm text-ice-500 mt-4">
                Redirecting to dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-arctic-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-ice-600">{message}</p>
              <p className="text-sm text-ice-500 mt-4">
                Redirecting back to registration...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
