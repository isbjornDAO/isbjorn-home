import React, { useState } from 'react';
import { TransactionButton, useActiveAccount } from "thirdweb/react";
import { prepareContractCall, getContract } from "thirdweb";
import { thirdwebClient, CHARITY_WALLET_ADDRESS, avalancheFuji } from '@/lib/thirdwebClient';
import { GiftIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import { parseUnits } from "ethers";

// USDC Address on Avalanche Fuji Testnet (Circle Native)
const USDC_TOKEN_ADDRESS = "0x5425890298aed601595a70ab815c96711a31bc65";

interface CryptoDonationButtonProps {
    amount: string; // Amount in major units (e.g. "5" for 5 USDC)
    label?: string;
    onSuccess?: (txHash: string) => void;
    onError?: (error: Error) => void;
    disabled?: boolean;
    className?: string;
}

const CryptoDonationButton: React.FC<CryptoDonationButtonProps> = ({
    amount,
    label = "Donate",
    onSuccess,
    onError,
    disabled = false,
    className = ""
}) => {
    const account = useActiveAccount();
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

    // If amount is invalid or empty, disable
    const isValidAmount = amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

    // Prepare the simplified transaction
    // Sends USDC (ERC-20) on Fuji
    const prepareDonation = () => {
        if (!amount || !isValidAmount) throw new Error("Invalid donation amount");

        // Contract definition for USDC
        const contract = getContract({
            client: thirdwebClient!,
            chain: avalancheFuji,
            address: USDC_TOKEN_ADDRESS,
        });

        // Determine decimal precision (USDC is 6 decimals)
        const amountInUnits = parseUnits(amount, 6);

        // ERC-20 Transfer
        return prepareContractCall({
            contract,
            method: "function transfer(address to, uint256 value)",
            params: [CHARITY_WALLET_ADDRESS, amountInUnits],
        });
    };

    return (
        <div className="w-full">
            <TransactionButton
                transaction={prepareDonation}
                onTransactionSent={() => {
                    setStatus('pending');
                }}
                onTransactionConfirmed={(receipt) => {
                    setStatus('success');
                    console.log("Donation confirmed:", receipt.transactionHash);
                    if (onSuccess) onSuccess(receipt.transactionHash);

                    // Reset status after 3 seconds
                    setTimeout(() => setStatus('idle'), 3000);
                }}
                onError={(error) => {
                    console.error("Donation failed:", error);
                    setStatus('error');
                    if (onError) onError(error);
                }}
                disabled={disabled || !isValidAmount}
                unstyled
                className={`w-full relative overflow-hidden group ${className}`}
            >
                {/* Button Content */}
                <div className={`
                    w-full px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2
                    ${!isValidAmount || disabled
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : status === 'error'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : status === 'success'
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25'
                    }
                `}>
                    {status === 'pending' ? (
                        <>
                            <LoadingSpinner size="small" />
                            <span>Processing...</span>
                        </>
                    ) : status === 'success' ? (
                        <>
                            <CheckCircleIcon className="h-5 w-5" />
                            <span>Donated!</span>
                        </>
                    ) : status === 'error' ? (
                        <>
                            <ExclamationCircleIcon className="h-5 w-5" />
                            <span>Failed</span>
                        </>
                    ) : (
                        <>
                            <GiftIcon className="h-5 w-5" />
                            <span>
                                {account ? `${label} ${amount ? `${amount} USDC` : ''}` : 'Connect Wallet'}
                            </span>
                        </>
                    )}
                </div>
            </TransactionButton>

            {/* Helper Text */}
            {!account && (
                <p className="text-xs text-center mt-2 text-gray-400">
                    Wallet will connect automatically
                </p>
            )}
            {account && isValidAmount && (
                <p className="text-xs text-center mt-2 text-gray-400">
                    Sending to verified charity address
                </p>
            )}
        </div>
    );
};

export default CryptoDonationButton;
