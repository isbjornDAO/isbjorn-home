import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  DocumentDownloadIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/solid';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ComplianceData {
  complianceScore: number;
  company: {
    isVerified: boolean;
    isCompliant: boolean;
    issues: string[];
  };
  donations: {
    totalCount: number;
    compliantCount: number;
    totalAmount: number;
    complianceRate: number;
    taxYear: number;
  };
  irdAuditReady: boolean;
  nextSteps: string[];
}

interface Donation {
  id: string;
  receiptNumber: string;
  charityName: string;
  amount: number;
  donationDate: Date;
  taxYear: number;
  receiptPdfUrl: string;
  irdCompliant: boolean;
}

const ComplianceDashboardPage: React.FC = () => {
  const [companyNumber, setCompanyNumber] = useState('');
  const [selectedTaxYear, setSelectedTaxYear] = useState(new Date().getFullYear());
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const availableTaxYears = [2024, 2023, 2022, 2021, 2020];

  const handleSearch = async () => {
    if (!companyNumber || companyNumber.length < 6) {
      alert('Please enter a valid NZ company number');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      // Load compliance dashboard
      const complianceResponse = await fetch(`/api/companies/${companyNumber}/compliance-dashboard`);
      const complianceResult = await complianceResponse.json();

      if (complianceResult.success) {
        setComplianceData(complianceResult.data);
      }

      // Load donation history
      const donationsResponse = await fetch(`/api/companies/${companyNumber}/donations?taxYear=${selectedTaxYear}`);
      const donationsResult = await donationsResponse.json();

      if (donationsResult.success) {
        setDonations(donationsResult.data);
      }

    } catch (error) {
      console.error('Failed to load compliance data:', error);
      alert('Failed to load compliance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (donationId: string) => {
    window.open(`/api/receipts/${donationId}/download`, '_blank');
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceScoreBg = (score: number) => {
    if (score >= 95) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 to-arctic-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-ice-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-arctic-900">
                🛡️ IRD Compliance Dashboard
              </h1>
              <p className="text-arctic-600 mt-2">
                Monitor your donation compliance and IRD audit readiness
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
              <span className="text-sm font-medium text-arctic-600">Audit Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-ice-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-arctic-900 mb-4">Company Lookup</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-arctic-700 mb-2">
                NZ Company Number
              </label>
              <input
                type="text"
                value={companyNumber}
                onChange={(e) => setCompanyNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="1234567"
                className="w-full px-4 py-3 border border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-transparent"
                maxLength={10}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-arctic-700 mb-2">
                Tax Year
              </label>
              <select
                value={selectedTaxYear}
                onChange={(e) => setSelectedTaxYear(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-transparent"
              >
                {availableTaxYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex-shrink-0 self-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-arctic-600 text-white rounded-lg font-semibold hover:bg-arctic-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Loading...</span>
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Compliance Overview */}
        {complianceData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Compliance Score */}
            <div className={`rounded-xl p-6 border-2 ${getComplianceScoreBg(complianceData.complianceScore)}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-arctic-900">Compliance Score</h3>
                <div className={`text-3xl font-bold ${getComplianceScoreColor(complianceData.complianceScore)}`}>
                  {complianceData.complianceScore}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className={`h-3 rounded-full ${
                    complianceData.complianceScore >= 95 
                      ? 'bg-green-500' 
                      : complianceData.complianceScore >= 80 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${complianceData.complianceScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-arctic-600">
                {complianceData.irdAuditReady 
                  ? '✅ IRD Audit Ready' 
                  : '⚠️ Compliance issues detected'
                }
              </p>
            </div>

            {/* Company Status */}
            <div className="bg-white rounded-xl border border-ice-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-arctic-900">Company Status</h3>
                {complianceData.company.isCompliant ? (
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                ) : (
                  <ExclamationCircleIcon className="h-8 w-8 text-yellow-500" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Verified:</span>
                  <span className={complianceData.company.isVerified ? 'text-green-600' : 'text-red-600'}>
                    {complianceData.company.isVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Compliant:</span>
                  <span className={complianceData.company.isCompliant ? 'text-green-600' : 'text-red-600'}>
                    {complianceData.company.isCompliant ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              {complianceData.company.issues.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Issues:</p>
                  <ul className="text-sm text-yellow-700 mt-1">
                    {complianceData.company.issues.map((issue, idx) => (
                      <li key={idx}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Donation Summary */}
            <div className="bg-white rounded-xl border border-ice-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-arctic-900">Donations ({selectedTaxYear})</h3>
                <CurrencyDollarIcon className="h-8 w-8 text-arctic-500" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-arctic-600">
                    <span>Total Amount</span>
                    <span className="font-semibold">${complianceData.donations.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-arctic-600">
                    <span>Total Donations</span>
                    <span className="font-semibold">{complianceData.donations.totalCount}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-arctic-600">
                    <span>Compliant</span>
                    <span className="font-semibold text-green-600">
                      {complianceData.donations.compliantCount}/{complianceData.donations.totalCount}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${complianceData.donations.complianceRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {complianceData && complianceData.nextSteps.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 Next Steps</h3>
            <div className="space-y-2">
              {complianceData.nextSteps.map((step, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600 mt-0.5 mr-3">
                    {idx + 1}
                  </div>
                  <p className="text-blue-800">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donation History Table */}
        {hasSearched && (
          <div className="bg-white rounded-xl shadow-sm border border-ice-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-ice-200">
              <h3 className="text-lg font-semibold text-arctic-900">
                Donation History - {selectedTaxYear}
              </h3>
            </div>
            
            {donations.length === 0 ? (
              <div className="p-8 text-center">
                <DocumentTextIcon className="h-12 w-12 text-arctic-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-arctic-500 mb-2">No donations found</h4>
                <p className="text-arctic-400">
                  {companyNumber 
                    ? `No donations found for company ${companyNumber} in ${selectedTaxYear}`
                    : 'Enter a company number to view donation history'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-ice-200">
                  <thead className="bg-ice-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-arctic-500 uppercase tracking-wider">
                        Receipt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-arctic-500 uppercase tracking-wider">
                        Charity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-arctic-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-arctic-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-arctic-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-arctic-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-ice-200">
                    {donations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-ice-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-arctic-900">
                            {donation.receiptNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-arctic-900">{donation.charityName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-arctic-900">
                            ${donation.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-arctic-500">
                            {new Date(donation.donationDate).toLocaleDateString('en-NZ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              donation.irdCompliant
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {donation.irdCompliant ? '✅ Compliant' : '⚠️ Review'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDownloadReceipt(donation.id)}
                            className="text-arctic-600 hover:text-arctic-900 flex items-center"
                          >
                            <DocumentDownloadIcon className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceDashboardPage;