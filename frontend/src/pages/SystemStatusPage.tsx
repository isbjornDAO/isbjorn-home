import React, { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface HealthCheckResult {
  status: string;
  timestamp: string;
  durationMs?: number;
  checks: {
    stripe: { ok: boolean; error?: string };
    avalanche: { ok: boolean; details?: any; error?: string };
    nzCompaniesApi: { ok: boolean; error?: string };
    nzCharitiesApi: { ok: boolean; error?: string };
    email: { ok: boolean; error?: string };
    irdApi: { ok: boolean; error?: string };
  };
}

const badgeClasses = (ok: boolean) =>
  ok
    ? 'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800'
    : 'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800';

const SystemStatusPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HealthCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.get<HealthCheckResult>('/health/deep');
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load system status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const allOk =
    data &&
    Object.values(data.checks).every((check) => (check as any).ok);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 to-arctic-50">
      <div className="bg-white shadow-sm border-b border-ice-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-arctic-900">
              ❄️ Isbjørn Platform Status
            </h1>
            <p className="text-arctic-600 mt-1">
              Live view of payment, blockchain, and compliance infrastructure.
            </p>
          </div>
          <button
            onClick={loadStatus}
            disabled={loading}
            className="px-4 py-2 bg-arctic-600 text-white rounded-lg text-sm font-semibold hover:bg-arctic-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {error && !loading && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-ice-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-arctic-500">
                    Last checked:{' '}
                    {new Date(data.timestamp).toLocaleString('en-NZ')}
                  </p>
                  {typeof data.durationMs === 'number' && (
                    <p className="text-xs text-arctic-400">
                      Completed in {(data.durationMs / 1000).toFixed(2)}s
                    </p>
                  )}
                </div>
                <span
                  className={
                    badgeClasses(allOk || data.status === 'healthy')
                  }
                >
                  {allOk || data.status === 'healthy'
                    ? 'All systems operational'
                    : 'Degraded – check details'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stripe */}
              <div className="bg-white rounded-xl shadow-sm border border-ice-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-arctic-900">
                    Stripe Payments
                  </h2>
                  <span className={badgeClasses(data.checks.stripe.ok)}>
                    {data.checks.stripe.ok ? 'Online' : 'Issue'}
                  </span>
                </div>
                {data.checks.stripe.error && (
                  <p className="text-xs text-red-600">
                    {data.checks.stripe.error}
                  </p>
                )}
                {!data.checks.stripe.error && (
                  <p className="text-xs text-arctic-500">
                    Card payments and webhooks.
                  </p>
                )}
              </div>

              {/* Avalanche / Iggy */}
              <div className="bg-white rounded-xl shadow-sm border border-ice-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-arctic-900">
                    Avalanche / Iggy L1
                  </h2>
                  <span className={badgeClasses(data.checks.avalanche.ok)}>
                    {data.checks.avalanche.ok ? 'Online' : 'Issue'}
                  </span>
                </div>
                {data.checks.avalanche.details && (
                  <p className="text-xs text-arctic-500">
                    Chain ID {data.checks.avalanche.details.chainId},{' '}
                    wallet {data.checks.avalanche.details.walletAddress}
                  </p>
                )}
                {data.checks.avalanche.error && (
                  <p className="text-xs text-red-600">
                    {data.checks.avalanche.error}
                  </p>
                )}
              </div>

              {/* NZ Companies API */}
              <div className="bg-white rounded-xl shadow-sm border border-ice-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-arctic-900">
                    NZ Companies Office API
                  </h2>
                  <span className={badgeClasses(data.checks.nzCompaniesApi.ok)}>
                    {data.checks.nzCompaniesApi.ok ? 'Online' : 'Issue'}
                  </span>
                </div>
                {data.checks.nzCompaniesApi.error && (
                  <p className="text-xs text-red-600">
                    {data.checks.nzCompaniesApi.error}
                  </p>
                )}
                {!data.checks.nzCompaniesApi.error && (
                  <p className="text-xs text-arctic-500">
                    Real-time company verification.
                  </p>
                )}
              </div>

              {/* NZ Charities API */}
              <div className="bg-white rounded-xl shadow-sm border border-ice-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-arctic-900">
                    NZ Charities Services API
                  </h2>
                  <span className={badgeClasses(data.checks.nzCharitiesApi.ok)}>
                    {data.checks.nzCharitiesApi.ok ? 'Online' : 'Issue'}
                  </span>
                </div>
                {data.checks.nzCharitiesApi.error && (
                  <p className="text-xs text-red-600">
                    {data.checks.nzCharitiesApi.error}
                  </p>
                )}
                {!data.checks.nzCharitiesApi.error && (
                  <p className="text-xs text-arctic-500">
                    Verified donee organisations and search.
                  </p>
                )}
              </div>

              {/* Email / SendGrid */}
              <div className="bg-white rounded-xl shadow-sm border border-ice-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-arctic-900">
                    Email & Receipts
                  </h2>
                  <span className={badgeClasses(data.checks.email.ok)}>
                    {data.checks.email.ok ? 'Online' : 'Issue'}
                  </span>
                </div>
                {data.checks.email.error && (
                  <p className="text-xs text-red-600">
                    {data.checks.email.error}
                  </p>
                )}
                {!data.checks.email.error && (
                  <p className="text-xs text-arctic-500">
                    SendGrid configuration and test email.
                  </p>
                )}
              </div>

              {/* IRD Compliance */}
              <div className="bg-white rounded-xl shadow-sm border border-ice-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-arctic-900">
                    IRD Compliance Engine
                  </h2>
                  <span className={badgeClasses(data.checks.irdApi.ok)}>
                    {data.checks.irdApi.ok ? 'Online' : 'Issue'}
                  </span>
                </div>
                {data.checks.irdApi.error && (
                  <p className="text-xs text-red-600">
                    {data.checks.irdApi.error}
                  </p>
                )}
                {!data.checks.irdApi.error && (
                  <p className="text-xs text-arctic-500">
                    Receipt data generation and donee status checks.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemStatusPage;


