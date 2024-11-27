import React, { useEffect, useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader, SlippageInput, TokenChooser } from '@/components/shared';
import { Separator } from '@/components/ui/separator';
import { Switch } from "@/components/ui/switch"
import BN from 'bn.js';
import { defaultSlippage, explorer_url, QUASI_ADDRESS, Router_address, safeModeEnabledMaxSlippage, sample_token_list, WAVAX_ADDRESS } from '@/constants';
import { Token } from '@/types';
import { useUserContext } from '@/context/AuthContext';
import { approveERC20Amount, createSwapTransaction, getAmountOut, getERC20Allowance, useHandleConnectWallet } from '@/lib/wallet';
import { formatBN, scaleToBN } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';


const SwapPanel = () => {

    const { account, isConnected } = useUserContext();
    const { handleConnectWallet, isWalletLoading } = useHandleConnectWallet();
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [fromToken, setFromToken] = useState<Token>(sample_token_list[WAVAX_ADDRESS]);
    const [lastFromToken, setLastFromToken] = useState<Token>(fromToken);
    const [fromAmount, setFromAmount] = useState<BN>(new BN(0));
    const [fromAmountInputValue, setFromAmountInputValue] = useState<string>('');
    const [fromTokenAllowance, setFromTokenAllowance] = useState<BN>(new BN(0));

    const [toToken, setToToken] = useState<Token>(sample_token_list[QUASI_ADDRESS]);
    const [lastToToken, setLastToToken] = useState<Token>(toToken);
    const [toAmount, setToAmount] = useState<BN>(new BN(0));
    const [toAmountInputValue, setToAmountInputValue] = useState<string>('');

    const [amountOutComputed, setAmountOutComputed] = useState<BN>(new BN(0));

    const [wasFromLastChanged, setWasFromLastChanged] = useState<boolean>(true);

    const [isChartLoaded, setIsChartLoaded] = useState<boolean>(false);

    const [allowedSlippage, setAllowedSlippage] = useState<number>(defaultSlippage);
    const [safeModeEnabled, setSafeModeEnabled] = useState<boolean>(true);

    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const clearPanel = () => {
        setFromAmountInputValue('');
        setToAmountInputValue('');
    }


    const handleFromInputChange = (value: string) => {
        setIsLoading(true);
        setToAmount(new BN(0));
        if (!isNaN(Number(value)) || value === '') {
            setFromAmountInputValue(value);
            if (value === '') {
                setFromAmount(new BN(0));
                return;
            }
        }

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const newTimer = setTimeout(async () => {
            if (!isNaN(Number(value)) && value !== '') {
                setFromAmount(scaleToBN(value, fromToken.decimals))
            }
        }, 1000);

        setDebounceTimer(newTimer);
    };



    const switchToAndFrom = () => {
        const tempToToken = toToken;
        const tempLastToToken = lastToToken;
        setToToken(fromToken);
        setLastToToken(lastFromToken);
        setFromToken(tempToToken);
        setLastFromToken(tempLastToToken);
    };

    const onFromTokenChange = (value: Token) => {
        setLastFromToken(fromToken);
        setFromToken(value);
        setWasFromLastChanged(true);
    }

    const onToTokenChange = (value: Token) => {
        setLastToToken(toToken);
        setToToken(value);
        setWasFromLastChanged(false);
    };

    const handleSwapButtonClick = async () => {
        setIsLoading(true);
        if (fromTokenAllowance.gte(fromAmount)) {
            const isFromExact = true;
            const result = await createSwapTransaction(account.address, fromToken.address, toToken.address, isFromExact, fromAmount, amountOutComputed, allowedSlippage);
            if (result.success) {
                showToast("Swap executed", "success", explorer_url + "/tx/" + result.txHash);
                clearPanel();
            } else {
                showToast("Swap failed", "error", result?.txHash ? (explorer_url + "/tx/" + result.txHash) : undefined);
            }
        } else {
            const result = await approveERC20Amount(account.address, Router_address, fromToken.address, fromAmount);
            if (result.success) {
                showToast("Approved tokens for swap", "success", explorer_url + "/tx/" + result.txHash);
                setFromTokenAllowance(fromAmount);
            } else {
                showToast("Failed to approve tokens", "error", result?.txHash ? (explorer_url + "/tx/" + result.txHash) : undefined);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        // if to or from token changed to same token, force update using last token
        if (fromToken === toToken) {
            if (wasFromLastChanged) {
                setLastToToken(toToken);
                setToToken(lastFromToken);
            } else {
                setLastFromToken(fromToken);
                setFromToken(lastToToken);
            }
        }
    }, [fromToken, toToken]);

    useEffect(() => {
        if (safeModeEnabled) {
            if (allowedSlippage > safeModeEnabledMaxSlippage) {
                setAllowedSlippage(safeModeEnabledMaxSlippage);
            }
        }
    }, [safeModeEnabled]);

    useEffect(() => {
        const getOutputAmount = async () => {
            if (fromAmount.gt(new BN(0))) {
                const amountOut = await getAmountOut(fromToken.address, toToken.address, fromAmount);
                if (amountOut !== null) {
                    setToAmountInputValue(formatBN(amountOut, fromToken.decimals));
                    setAmountOutComputed(amountOut);
                }
            } else {

            }
            setIsLoading(false);
        };
        getOutputAmount();
    }, [fromAmount])

    useEffect(() => {
        const getFromTokenAllowance = async () => {
            if (fromAmount.gt(new BN(0))) {
                const allowance = await getERC20Allowance(account.address, Router_address, fromToken.address);
                if (allowance !== null) {
                    setFromTokenAllowance(allowance);
                }
            }
        };
        getFromTokenAllowance();
    }, [account, fromAmount, fromToken])

    return (
        <div className='flex flex-col gap-1 items-center justify-start'>
            <div>
                <Card className='card w-[640px]'>
                    <CardContent className='p-4'>
                        <div className='flex flex-row gap-1'>
                            <div className='flex-1 border border-black text-center rounded-lg'>
                                {
                                    isChartLoaded
                                        ? (<div>CHART HERE</div>)
                                        : (
                                            <img
                                                src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e24f4c389a939113cc19_TRANSPARENCY-p-800.png"
                                                alt="looking for chart"
                                                className='h-full w-full'
                                            />
                                        )
                                }
                            </div>
                            <div className='flex-1 flex flex-col px-3'>
                                <div className='flex-1 flex flex-row p-2 items-center'>
                                    <Input
                                        type="number"
                                        placeholder="0.0"
                                        className='text-dodger-blue bg-white no-arrows mr-2'
                                        autoComplete="off"
                                        value={fromAmountInputValue}
                                        onChange={(e) => handleFromInputChange(e.target.value)}
                                    />
                                    <TokenChooser startSelected={fromToken} available={sample_token_list} onSelection={onFromTokenChange} />
                                </div>
                                <div className='relative'>
                                    <Separator className='my-4 bg-isbjorn-blue seperator' />
                                    <div
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer border border-isbjorn-blue"
                                        onClick={switchToAndFrom}
                                    >
                                        <FaChevronDown className="text-isbjorn-blue text-lg pt-1" />
                                    </div>
                                </div>
                                <div className='flex-1 flex flex-row p-2 items-center'>
                                    <Input
                                        type="number"
                                        placeholder="0.0"
                                        className='text-dodger-blue bg-white no-arrows mr-2'
                                        autoComplete="off"
                                        value={toAmountInputValue}
                                    />
                                    <TokenChooser startSelected={toToken} available={sample_token_list} onSelection={onToTokenChange} />
                                </div>
                                <div className='w-full p-2 flex flex-row justify-between'>
                                    <div className='flex flex-row items-center'>
                                        <div className='flex safemode-toggle items-center justify-center mr-1'>Safe Mode </div>
                                        <Switch
                                            className={safeModeEnabled ? "bg-green" : "bg-red"}
                                            checked={safeModeEnabled}
                                            onCheckedChange={setSafeModeEnabled} />
                                    </div>
                                    <div className='flex flex-row'>
                                        <div className='flex slippage-input items-center justify-center mr-1'>Slippage </div>
                                        <SlippageInput allowedSlippage={allowedSlippage} setAllowedSlippage={setAllowedSlippage} safeModeEnabled={safeModeEnabled} />
                                    </div>
                                </div>
                                <div className='w-full p-2'>
                                    <Button
                                        disabled={isWalletLoading || isLoading}
                                        className="swap-button"
                                        onClick={() => {
                                            if (isConnected) {
                                                handleSwapButtonClick();
                                            } else {
                                                handleConnectWallet();
                                            }
                                        }}>{isWalletLoading || isLoading ? (
                                            <Loader />
                                        ) : account.address ? (
                                            fromTokenAllowance.gte(fromAmount) ? (
                                                "Swap"
                                            ) : (
                                                "Approve"
                                            )

                                        ) : (
                                            "Connect"
                                        )}</Button>
                                </div>

                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}

export default SwapPanel