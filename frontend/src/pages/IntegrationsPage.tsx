import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

interface IntegrationStatus {
  connected: boolean;
  integrationType?: string;
  integrations: {
    xero: boolean;
    myob: boolean;
  };
  autoSync: boolean;
  syncReceipts: boolean;
  syncFees: boolean;
  lastSyncDate?: string;
  syncErrors: string[];
}

interface IntegrationUrls {
  xero: string;
  myob: string;
  setupInstructions: {
    xero: string;
    myob: string;
  };
}

const IntegrationsPage: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [urls, setUrls] = useState<IntegrationUrls | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchIntegrationData();
    }
  }, [user]);

  const fetchIntegrationData = async () => {
    try {
      const [statusData, urlsData] = await Promise.all([
        apiService.get<{ data: IntegrationStatus }>('/integrations/status'),
        apiService.get<{ data: IntegrationUrls }>('/integrations/urls')
      ]);

      setStatus(statusData.data);
      setUrls(urlsData.data);
    } catch (error) {
      console.error('Error fetching integration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<IntegrationStatus>) => {
    setUpdating(true);
    try {
      const data = await apiService.patch<{ data: Partial<IntegrationStatus> }>('/integrations/settings', updates);
      setStatus(prev => ({ ...prev!, ...data.data }));
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setUpdating(false);
    }
  };

  const disconnectIntegration = async (type?: string) => {
    try {
      const endpoint = type
        ? `/integrations/disconnect/${type}`
        : '/integrations/disconnect';

      await apiService.delete(endpoint);
      await fetchIntegrationData();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
    }
  };

  const testConnection = async () => {
    try {
      const data = await apiService.post<{ data: { message: string; xero: boolean; myob: boolean } }>('/integrations/test');
      alert(`Connection test: ${data.data.message}\nXero: ${data.data.xero ? 'Connected' : 'Failed'}\nMYOB: ${data.data.myob ? 'Connected' : 'Failed'}`);
    } catch (error) {
      console.error('Error testing connection:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold text-ice-900 mb-4">Please Sign In</h2>
          <p className="text-ice-600">You need to be signed in to manage integrations.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
        <div className="card p-8 text-center">
          <p className="text-ice-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ice-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ice-900">Accounting Integrations</h1>
          <p className="text-ice-600 mt-2">Connect your accounting software for automatic donation tracking</p>
        </div>

        {/* IRD Compliance Card */}
        <div className="card p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-xl">✓</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-ice-900 mb-2">NZ IRD Compliance</h3>
              <p className="text-ice-600 mb-4">
                Automatic IRD-compliant receipts for all donations with proper tax deduction documentation.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>✅ Minimum donation:</strong> $5 NZD<br/>
                    <strong>✅ Tax deductible:</strong> Yes<br/>
                    <strong>✅ Auto receipts:</strong> Enabled
                  </div>
                  <div>
                    <strong>✅ IRD reporting:</strong> Automatic<br/>
                    <strong>✅ Donee verification:</strong> Real-time<br/>
                    <strong>✅ Audit ready:</strong> Professional docs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="card p-6 mb-6">
          <h3 className="text-xl font-bold text-ice-900 mb-4">Connection Status</h3>
          
          {!status?.connected ? (
            <div className="text-center py-8">
              <p className="text-ice-600 mb-6">No accounting integrations connected yet.</p>
              <p className="text-sm text-ice-500 mb-4">Connect Xero or MYOB to automatically sync donations to your accounting system.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <div className="font-medium text-green-900">Connected Integrations</div>
                  <div className="text-sm text-green-700">
                    {status.integrations.xero && 'Xero '}
                    {status.integrations.myob && 'MYOB '}
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={testConnection}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Test Connection
                  </button>
                </div>
              </div>

              {status.lastSyncDate && (
                <p className="text-sm text-ice-600">
                  Last sync: {new Date(status.lastSyncDate).toLocaleString()}
                </p>
              )}

              {status.syncErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Recent Sync Errors:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {status.syncErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Integration Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Xero Integration */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">X</span>
              </div>
              <div>
                <h4 className="font-bold text-ice-900">Xero</h4>
                <p className="text-sm text-ice-600">Cloud accounting software</p>
              </div>
            </div>
            
            {status?.integrations.xero ? (
              <div className="space-y-3">
                <div className="flex items-center text-green-600 text-sm">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  Connected
                </div>
                <button
                  onClick={() => disconnectIntegration('xero')}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Disconnect Xero
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-ice-600">
                  Automatically sync donations as journal entries in your Xero account.
                </p>
                {urls && (
                  <a
                    href={urls.xero}
                    className="btn-primary inline-block text-center text-sm px-4 py-2"
                  >
                    Connect Xero
                  </a>
                )}
              </div>
            )}
          </div>

          {/* MYOB Integration */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">M</span>
              </div>
              <div>
                <h4 className="font-bold text-ice-900">MYOB</h4>
                <p className="text-sm text-ice-600">Business management software</p>
              </div>
            </div>
            
            {status?.integrations.myob ? (
              <div className="space-y-3">
                <div className="flex items-center text-green-600 text-sm">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  Connected
                </div>
                <button
                  onClick={() => disconnectIntegration('myob')}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Disconnect MYOB
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-ice-600">
                  Automatically sync donations as general journal entries in MYOB.
                </p>
                {urls && (
                  <a
                    href={urls.myob}
                    className="btn-primary inline-block text-center text-sm px-4 py-2"
                  >
                    Connect MYOB
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        {status?.connected && (
          <div className="card p-6">
            <h3 className="text-xl font-bold text-ice-900 mb-4">Sync Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={status.autoSync}
                  onChange={(e) => updateSettings({ autoSync: e.target.checked })}
                  disabled={updating}
                  className="mr-3"
                />
                <span className="text-ice-900">Auto-sync donations</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={status.syncReceipts}
                  onChange={(e) => updateSettings({ syncReceipts: e.target.checked })}
                  disabled={updating}
                  className="mr-3"
                />
                <span className="text-ice-900">Include receipt references</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={status.syncFees}
                  onChange={(e) => updateSettings({ syncFees: e.target.checked })}
                  disabled={updating}
                  className="mr-3"
                />
                <span className="text-ice-900">Sync platform fees (1.5%)</span>
              </label>
            </div>

            {updating && (
              <p className="text-sm text-ice-600 mt-4">Updating settings...</p>
            )}
          </div>
        )}

        {/* Benefits */}
        <div className="card p-6 mt-6">
          <h3 className="text-xl font-bold text-ice-900 mb-4">Integration Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-ice-900">Automated Record Keeping</h4>
              <ul className="text-sm text-ice-600 space-y-1">
                <li>• Donations automatically recorded as journal entries</li>
                <li>• Platform fees tracked separately for tax purposes</li>
                <li>• IRD-compliant receipt references included</li>
                <li>• Real-time synchronization with your books</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-ice-900">Tax & Compliance</h4>
              <ul className="text-sm text-ice-600 space-y-1">
                <li>• All donations properly categorized for tax reporting</li>
                <li>• GST handling for platform fees</li>
                <li>• Audit-ready documentation</li>
                <li>• Simplified year-end accounting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;