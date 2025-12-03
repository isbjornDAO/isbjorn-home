import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, DocumentDownloadIcon, ClockIcon, CreditCardIcon } from '@heroicons/react/solid';

interface DonationResult {
  success: boolean;
  donationId: string;
  receiptNumber: string;
  processingTimeMs: number;
  receipt: {
    pdfUrl: string;
    emailSent: boolean;
  };
  accounting: {
    xeroExported: boolean;
    myobExported: boolean;
  };
  blockchain?: {
    transactionHash: string;
  };
}

const DonationSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [donation, setDonation] = useState<DonationResult | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);

  useEffect(() => {
    if (location.state) {
      const { donation: donationData, processingTime: procTime } = location.state as any;
      setDonation(donationData);
      setProcessingTime(procTime);
    } else {
      // If no state, redirect to home
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleDownloadReceipt = () => {
    if (donation?.receipt.pdfUrl) {
      // In a real implementation, this would trigger the download
      window.open(`/api/receipts/${donation.donationId}/download`, '_blank');
    }
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
  };

  if (!donation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ice-50 to-arctic-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arctic-500 mx-auto mb-4"></div>
          <p className="text-arctic-600">Loading donation details...</p>
        </div>
      </div>
    );
  }

  const formatTime = (ms: number) => {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 to-arctic-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Success Header */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-arctic-900 mb-1">
            🎉 Donation Successful!
          </h1>
          <p className="text-sm text-arctic-600">
            Your donation has been processed and is 100% IRD compliant
          </p>
        </div>

        {/* Processing Time Banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 mb-4 text-white text-center">
          <div className="flex items-center justify-center space-x-3">
            <ClockIcon className="h-6 w-6" />
            <div>
              <div className="text-2xl font-bold">{formatTime(processingTime)}</div>
              <p className="text-xs text-green-100">Total Processing Time</p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
          <p className="mt-1 text-xs text-green-100">
            That's {Math.round(120 - (processingTime / 1000))} seconds faster than the traditional 2-minute target!
          </p>
        </div>

        {/* Donation Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-ice-200 p-4 mb-4">
          <h2 className="text-lg font-semibold text-arctic-900 mb-3">Donation Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs font-medium text-arctic-500 uppercase tracking-wide">Receipt Number</h3>
              <p className="text-sm font-semibold text-arctic-900 mt-1">{donation.receiptNumber}</p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-arctic-500 uppercase tracking-wide">Donation ID</h3>
              <p className="text-sm font-mono text-arctic-700 mt-1">{donation.donationId}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-ice-200">
            <h3 className="text-xs font-medium text-arctic-500 uppercase tracking-wide mb-2">
              Processing Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-arctic-700">Payment processed successfully</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-arctic-700">IRD-compliant receipt generated</span>
              </div>
              <div className="flex items-center">
                {donation.receipt.emailSent ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <ClockIcon className="h-4 w-4 text-yellow-500 mr-2" />
                )}
                <span className="text-sm text-arctic-700">
                  Receipt {donation.receipt.emailSent ? 'emailed' : 'being emailed'}
                </span>
              </div>
              <div className="flex items-center">
                {donation.accounting.xeroExported ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <ClockIcon className="h-4 w-4 text-yellow-500 mr-2" />
                )}
                <span className="text-sm text-arctic-700">
                  {donation.accounting.xeroExported
                    ? 'Exported to Xero'
                    : 'Xero export in progress'
                  }
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-arctic-700">Receipt archived for 7 years (IRD compliant)</span>
              </div>
            </div>
          </div>
        </div>

        {/* IRD Compliance Card */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-green-900 mb-1">
                ✅ 100% IRD Audit Ready
              </h3>
              <p className="text-xs text-green-800 mb-2">
                Your donation receipt contains all 7 elements required by IRD for tax deduction purposes:
              </p>
              <ul className="text-xs text-green-700 space-y-0.5">
                <li>• Official letterhead and receipt number</li>
                <li>• Legal donation statement</li>
                <li>• Donor and charity legal names</li>
                <li>• Complete addresses</li>
                <li>• Donation amount and date</li>
                <li>• Charity IRD and DIA registration numbers</li>
                <li>• Authorized person signature</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleDownloadReceipt}
            className="flex-1 bg-arctic-600 text-white py-2 px-4 text-sm rounded-lg font-semibold hover:bg-arctic-700 transition-colors flex items-center justify-center"
          >
            <DocumentDownloadIcon className="h-4 w-4 mr-2" />
            Download Receipt PDF
          </button>
          
          <button
            onClick={handleViewDashboard}
            className="flex-1 bg-white border-2 border-arctic-600 text-arctic-600 py-2 px-4 text-sm rounded-lg font-semibold hover:bg-arctic-50 transition-colors"
          >
            View Dashboard
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-ice-100 text-arctic-700 py-2 px-4 text-sm rounded-lg font-semibold hover:bg-ice-200 transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Next Steps */}
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            📋 What's Next?
          </h3>
          <div className="space-y-1 text-xs text-blue-800">
            <p>• Your IRD-compliant receipt has been automatically archived for 7 years</p>
            <p>• The donation will appear in your accounting software within 24 hours</p>
            <p>• You can access all receipts anytime through your compliance dashboard</p>
            <p>• Set up recurring donations to streamline future giving</p>
          </div>
        </div>

        {/* Blockchain (if enabled) */}
        {donation.blockchain && (
          <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-3">
            <h3 className="text-sm font-semibold text-purple-900 mb-2">
              🔗 Blockchain Record
            </h3>
            <p className="text-xs text-purple-800 mb-2">
              Your donation has been transparently recorded on the blockchain:
            </p>
            <p className="text-xs font-mono text-purple-600 bg-purple-100 p-2 rounded break-all">
              {donation.blockchain.transactionHash}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center text-arctic-500 text-xs">
          <p>Thank you for choosing Isbjørn for your charitable giving!</p>
          <p className="mt-1">
            Making NZ business donations 10x faster and 100% IRD compliant.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationSuccessPage;