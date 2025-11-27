import React, { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { WalletConnect } from '@/components/WalletConnect';
import { ethers } from 'ethers';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const WalletPage: React.FC = () => {
    const { account, provider } = useWallet();
    const [balance, setBalance] = useState<string>('0.00');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBalance = async () => {
            if (account && provider) {
                setLoading(true);
                try {
                    const bal = await provider.getBalance(account);
                    setBalance(ethers.formatEther(bal));
                } catch (error) {
                    console.error('Error fetching balance:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchBalance();
    }, [account, provider]);

    return (
        <div className="min-h-screen bg-ice-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-ice-900">My Wallet</h1>
                    <p className="text-ice-600 mt-2">Manage your crypto funds and donations</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Balance Card */}
                    <div className="card p-6 md:col-span-2 bg-gradient-to-br from-arctic-600 to-arctic-800 text-white">
                        <h2 className="text-lg font-medium opacity-90 mb-2">Total Balance</h2>
                        <div className="text-4xl font-bold mb-4 flex items-baseline">
                            {loading ? (
                                <span className="animate-pulse">...</span>
                            ) : (
                                <>
                                    {parseFloat(balance).toFixed(4)} <span className="text-lg ml-2 opacity-75">AVAX</span>
                                </>
                            )}
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm">
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                <span>Deposit</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm">
                                <ArrowUpTrayIcon className="w-5 h-5" />
                                <span>Withdraw</span>
                            </button>
                        </div>
                    </div>

                    {/* Connection Card */}
                    <div className="card p-6 flex flex-col justify-center items-center text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                            <CurrencyDollarIcon className="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Wallet Status</h3>
                        <div className="mb-4">
                            <WalletConnect />
                        </div>
                        {!account && (
                            <p className="text-xs text-gray-500">
                                Connect your Core Wallet to view your balance and make donations.
                            </p>
                        )}
                    </div>
                </div>

                {/* Transactions / History Placeholder */}
                <div className="card p-6">
                    <h3 className="text-xl font-bold text-ice-900 mb-6">Recent Transactions</h3>
                    <div className="text-center py-12 text-gray-500">
                        <p>No transactions found yet.</p>
                        <p className="text-sm mt-2">Your donation history will appear here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
