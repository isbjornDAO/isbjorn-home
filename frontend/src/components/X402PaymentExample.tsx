import React, { useState } from 'react';
import { useX402 } from '../hooks/x402Hook';

/**
 * Example component showing how to integrate X402 payments
 *
 * This demonstrates the complete payment flow:
 * 1. Create payment intent
 * 2. User authorizes payment (would happen via wallet)
 * 3. Complete settlement with transaction hash
 */
export const X402PaymentExample: React.FC = () => {
    const { createPayment, completePayment, loading, error, payment } = useX402();
    const [amount, setAmount] = useState<number>(10);
    const [currency, setCurrency] = useState<string>('USD');
    const [txHash, setTxHash] = useState<string>('');
    const [step, setStep] = useState<'input' | 'created' | 'completed'>('input');

    const handleCreatePayment = async () => {
        try {
            const result = await createPayment(amount, currency);
            console.log('Payment intent created:', result);
            setStep('created');

            // In a real implementation, you would now:
            // 1. Show the payment details to the user
            // 2. Request wallet signature/approval
            // 3. Submit the transaction on-chain
            // 4. Get the transaction hash

            // For now, we'll show the user what to do next
        } catch (err) {
            console.error('Failed to create payment:', err);
        }
    };

    const handleCompletePayment = async () => {
        if (!payment?.donationId || !txHash) {
            alert('Please enter transaction hash');
            return;
        }

        try {
            const result = await completePayment(payment.donationId, txHash);
            console.log('Payment completed:', result);
            setStep('completed');
        } catch (err) {
            console.error('Failed to complete payment:', err);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">X402 Payment Test</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {step === 'input' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Amount
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border rounded-md"
                            min="1"
                            step="0.01"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Currency
                        </label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            <option value="USD">USD</option>
                            <option value="NZD">NZD</option>
                            <option value="AUD">AUD</option>
                        </select>
                    </div>

                    <button
                        onClick={handleCreatePayment}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Creating...' : 'Create Payment Intent'}
                    </button>
                </div>
            )}

            {step === 'created' && payment && (
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <h3 className="font-semibold text-green-900 mb-2">
                            ✅ Payment Intent Created
                        </h3>
                        <div className="text-sm space-y-1 text-green-800">
                            <p><strong>Donation ID:</strong> {payment.donationId}</p>
                            <p><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
                            <p><strong>Payment ID:</strong> {payment.id}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <h3 className="font-semibold text-yellow-900 mb-2">
                            ⚡ Next Steps
                        </h3>
                        <ol className="text-sm list-decimal list-inside space-y-1 text-yellow-800">
                            <li>Connect your wallet</li>
                            <li>Approve the transaction on Avalanche Fuji</li>
                            <li>Copy the transaction hash</li>
                            <li>Paste it below to complete</li>
                        </ol>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            💡 Payment Details
                        </h3>
                        <div className="text-sm space-y-1 text-blue-800">
                            <p><strong>Recipient:</strong></p>
                            <code className="block bg-white p-2 rounded text-xs break-all">
                                0x0C39f0970CF3118Fd004A3f069E59dabc6714980
                            </code>
                            <p className="mt-2"><strong>Network:</strong> Avalanche Fuji (43113)</p>
                            <p><strong>Protocol:</strong> X402 (Gasless via EIP-7702)</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Transaction Hash
                        </label>
                        <input
                            type="text"
                            value={txHash}
                            onChange={(e) => setTxHash(e.target.value)}
                            placeholder="0x..."
                            className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                        />
                    </div>

                    <button
                        onClick={handleCompletePayment}
                        disabled={loading || !txHash}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Completing...' : 'Complete Payment'}
                    </button>

                    <button
                        onClick={() => {
                            setStep('input');
                            setTxHash('');
                        }}
                        className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {step === 'completed' && (
                <div className="space-y-4">
                    <div className="p-4 bg-green-100 border border-green-300 rounded-md text-center">
                        <div className="text-4xl mb-2">🎉</div>
                        <h3 className="font-bold text-green-900 text-xl mb-2">
                            Payment Completed!
                        </h3>
                        <p className="text-green-800 text-sm">
                            Your payment has been successfully processed on Avalanche Fuji.
                        </p>
                        {txHash && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold mb-1">Transaction Hash:</p>
                                <code className="block bg-white p-2 rounded text-xs break-all">
                                    {txHash}
                                </code>
                                <a
                                    href={`https://testnet.snowtrace.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-2 text-blue-600 hover:underline text-sm"
                                >
                                    View on Snowtrace →
                                </a>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            setStep('input');
                            setTxHash('');
                            setAmount(10);
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                        Make Another Payment
                    </button>
                </div>
            )}

            <div className="mt-6 pt-4 border-t text-xs text-gray-600">
                <p className="font-semibold mb-1">Configuration:</p>
                <p>• Network: Avalanche Fuji Testnet</p>
                <p>• Chain ID: 43113</p>
                <p>• Protocol: X402 (Thirdweb Facilitator)</p>
                <p>• Wallet: 0x0C39...4980</p>
            </div>
        </div>
    );
};

export default X402PaymentExample;
