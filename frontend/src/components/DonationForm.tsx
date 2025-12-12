import React, { useState } from 'react';
import { useX402 } from '../hooks/x402Hook';
import { useAuth } from '../contexts/AuthContext'; // Assuming context exists

const DonationForm: React.FC = () => {
    const [amount, setAmount] = useState<number>(100);
    const { createPayment, loading: x402Loading, error: x402Error, payment: x402Payment } = useX402();
    const { user } = useAuth();
    const [step, setStep] = useState<'select' | 'process' | 'success'>('select');
    const [donationId, setDonationId] = useState<string | null>(null);

    const handleX402Donate = async () => {
        try {
            const result = await createPayment(amount, 'USD', user?.username);
            setDonationId(result.donationId);
            setStep('success'); // In real flow, we'd wait for wallet signature/payment completion
        } catch (err) {
            console.error(err);
        }
    };

    if (step === 'success') {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Donation Successful!</h2>
                <p className="text-gray-600 mb-6">Thank you for contributing ${amount} to conservation.</p>

                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                    <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                    <p className="font-mono text-sm text-gray-900 break-all">{x402Payment?.id || donationId}</p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.open(`/api/x402/verify/${donationId}`, '_blank')}
                        className="w-full bg-arctic-600 text-white py-3 rounded-lg font-semibold hover:bg-arctic-700 transition-colors"
                    >
                        Download Tax Receipt
                    </button>
                    <button
                        onClick={() => setStep('select')}
                        className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Make Another Donation
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Business Donation</h2>

            {/* Amount Selection */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Amount</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {[100, 500, 1000].map((val) => (
                        <button
                            key={val}
                            onClick={() => setAmount(val)}
                            className={`py-2 px-4 rounded-lg border-2 font-medium transition-all ${amount === val
                                ? 'border-arctic-500 bg-arctic-50 text-arctic-700'
                                : 'border-gray-200 hover:border-arctic-200 text-gray-600'
                                }`}
                        >
                            ${val}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-transparent"
                        placeholder="Custom Amount"
                    />
                </div>
            </div>

            {/* Action */}
            <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                    <p className="font-semibold mb-1">⚡ Powered by x402</p>
                    <p>Instant tax receipt • Automated compliance • 100% to conservation</p>
                </div>

                {x402Error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        {x402Error}
                    </div>
                )}

                <button
                    onClick={handleX402Donate}
                    disabled={x402Loading}
                    className="w-full bg-arctic-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-arctic-700 transition-all shadow-lg shadow-arctic-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {x402Loading ? 'Processing...' : `Donate $${amount} via x402`}
                </button>
            </div>
        </div>
    );
};

export default DonationForm;
