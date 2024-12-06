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
import { approveERC20Amount, createSwapTransaction, createUnwrapAvaxTransaction, createWrapAvaxTransaction, getAmountIn, getAmountOut, getERC20Allowance, useHandleConnectWallet } from '@/lib/wallet';
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
    const [fromBalance, setFromTokenBalance] = useState<BN>(new BN(0));

    const [toToken, setToToken] = useState<Token>(sample_token_list[QUASI_ADDRESS]);
    const [lastToToken, setLastToToken] = useState<Token>(toToken);
    const [toAmount, setToAmount] = useState<BN>(new BN(0));
    const [toAmountInputValue, setToAmountInputValue] = useState<string>('');
    const [toBalance, setToTokenBalance] = useState<BN>(new BN(0));

    const [amountOutComputed, setAmountOutComputed] = useState<BN>(new BN(0));
    const [amountInComputed, setAmountInComputed] = useState<BN>(new BN(0));

    const [wasFromLastChanged, setWasFromLastChanged] = useState<boolean>(true);

    const [isFromAmountExact, setIsFromAmountExact] = useState<boolean>(true);

    const [isChartLoaded, setIsChartLoaded] = useState<boolean>(false);

    const [allowedSlippage, setAllowedSlippage] = useState<number>(defaultSlippage);
    const [safeModeEnabled, setSafeModeEnabled] = useState<boolean>(true);

    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const [pairExists, setPairExists] = useState<boolean>(true);

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
                setToAmountInputValue('');
                setIsLoading(false);
                return;
            }
            setIsFromAmountExact(true);
        }

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const newTimer = setTimeout(async () => {
            if (!isNaN(Number(value)) && value !== '') {
                setFromAmount(scaleToBN(value, fromToken.decimals));
            }
        }, 1000);

        setDebounceTimer(newTimer);
    };

    const handleToInputChange = (value: string) => {
        setIsLoading(true);
        setFromAmount(new BN(0));
        if (!isNaN(Number(value)) || value === '') {
            setToAmountInputValue(value);
            if (value === '') {
                setToAmount(new BN(0));
                setFromAmountInputValue('');
                setIsLoading(false);
                return;
            }
            setIsFromAmountExact(false);
        }

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const newTimer = setTimeout(async () => {
            if (!isNaN(Number(value)) && value !== '') {
                setToAmount(scaleToBN(value, toToken.decimals));
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
        console.log(fromAmount.toString());
        console.log(fromTokenAllowance.toString());
        if ((fromTokenAllowance.gte(fromAmount) && isFromAmountExact) || (fromTokenAllowance.gte(amountInComputed.mul(new BN(100 + allowedSlippage)).div(new BN(100))) && !isFromAmountExact)) {
            if (fromAmount.isZero() && toAmount.isZero()) {
                return;
            }
            setIsLoading(true);
            let result;
            if (fromToken.address === "0xAVAX" && toToken.address === WAVAX_ADDRESS) {
                result = await createWrapAvaxTransaction(account.address, fromAmount);
            } else if (fromToken.address === WAVAX_ADDRESS && toToken.address === "0xAVAX") {
                result = await createUnwrapAvaxTransaction(account.address, fromAmount);
            } else if (isFromAmountExact) {
                result = await createSwapTransaction(account.address, fromToken.address, toToken.address, true, fromAmount, amountOutComputed, allowedSlippage);
            } else {
                result = await createSwapTransaction(account.address, fromToken.address, toToken.address, false, amountInComputed, toAmount, allowedSlippage);
            }
            if (result.success) {
                showToast("Swap executed", "success", explorer_url + "/tx/" + result.txHash);
                clearPanel();
            } else {
                showToast("Swap failed", "error", result?.txHash ? (explorer_url + "/tx/" + result.txHash) : undefined);
            }
        } else {
            setIsLoading(true);
            const result = await approveERC20Amount(account.address, Router_address, fromToken.address, isFromAmountExact ? fromAmount : amountInComputed.mul(new BN(100 + allowedSlippage)).div(new BN(100)));
            if (result.success) {
                showToast("Approved tokens for swap", "success", explorer_url + "/tx/" + result.txHash);
                setFromTokenAllowance(isFromAmountExact ? fromAmount : amountInComputed.mul(new BN(100 + allowedSlippage)).div(new BN(100)));
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
        const isWrapping = fromToken.address === "0xAVAX" && toToken.address === WAVAX_ADDRESS;
        const isUnwrapping = toToken.address === "0xAVAX" && fromToken.address === WAVAX_ADDRESS;
        const getOutputAmount = async () => {
            if ((isWrapping || isUnwrapping) && fromAmount.gt(new BN(0))) {
                setToAmountInputValue(formatBN(fromAmount, 18)); // always 18 for WAVAX or AVAX
                setAmountOutComputed(fromAmount);
            } else if (fromAmount.gt(new BN(0))) {
                const amountOut = await getAmountOut(fromToken.address === "0xAVAX" ? WAVAX_ADDRESS.toString() : fromToken.address, toToken.address === "0xAVAX" ? WAVAX_ADDRESS.toString() : toToken.address, fromAmount);
                if (amountOut !== null) {
                    setToAmountInputValue(formatBN(amountOut, toToken.decimals));
                    setAmountOutComputed(amountOut);
                }
            } else {
                setToAmount(new BN(0));
                return;
            }
            setIsLoading(false);
        };
        if (isFromAmountExact || isWrapping || isUnwrapping) {
            getOutputAmount();
        }
    }, [fromAmount, toToken, fromToken]);

    useEffect(() => {
        const isWrapping = fromToken.address === "0xAVAX" && toToken.address === WAVAX_ADDRESS;
        const isUnwrapping = toToken.address === "0xAVAX" && fromToken.address === WAVAX_ADDRESS;
        const getInAmount = async () => {
            if ((isWrapping || isUnwrapping) && toAmount.gt(new BN(0))) {
                setFromAmountInputValue(formatBN(toAmount, 18)); // always 18 for WAVAX or AVAX
                setAmountInComputed(toAmount);
            } else if (toAmount.gt(new BN(0))) {
                const amountIn = await getAmountIn(fromToken.address === "0xAVAX" ? WAVAX_ADDRESS.toString() : fromToken.address, toToken.address === "0xAVAX" ? WAVAX_ADDRESS.toString() : toToken.address, toAmount);
                if (amountIn !== null) {
                    setFromAmountInputValue(formatBN(amountIn, fromToken.decimals));
                    setAmountInComputed(amountIn);
                }
            } else {
                setFromAmount(new BN(0));
                return;
            }
            setIsLoading(false);
        };
        if (!isFromAmountExact) {
            getInAmount();
        }
    }, [toAmount, toToken, fromToken]);

    useEffect(() => {
        const getFromTokenAllowance = async () => {
            if (fromToken.address !== "0xAVAX" && fromAmount.gt(new BN(0))) {
                const allowance = await getERC20Allowance(account.address, Router_address, fromToken.address);
                if (allowance !== null) {
                    setFromTokenAllowance(allowance);
                }
            } else if (fromToken.address === "0xAVAX") {
                setFromTokenAllowance(new BN("720000000000000000000000000"));
            }
        };
        getFromTokenAllowance();
    }, [account, fromAmount, fromToken]);

    useEffect(() => {
        if (account.balances) {
            if (account.balances[fromToken.address.toLowerCase()]) {
                setFromTokenBalance(account.balances[fromToken.address.toLowerCase()]);
            }
        }
    }, [fromToken, account.balances]);

    useEffect(() => {
        if (account.balances) {
            if (account.balances[toToken.address.toLowerCase()]) {
                setToTokenBalance(account.balances[toToken.address.toLowerCase()]);
            }
        }
    }, [toToken, account.balances]);

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
                                <div className='flex-1 flex flex-row p-2 pb-0 items-center'>
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
                                <div className="p-2 pt-0 text-xxs font-semibold hover:cursor-pointer">
                                    <p
                                        onClick={() => {
                                            setFromAmount(fromBalance);
                                            setFromAmountInputValue(formatBN(fromBalance, fromToken.decimals));
                                        }}
                                        className='ml-2'>{`wallet: ${Number(formatBN(fromBalance, fromToken.decimals)).toLocaleString()}`}</p>
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
                                        onChange={(e) => handleToInputChange(e.target.value)}
                                    />
                                    <TokenChooser startSelected={toToken} available={sample_token_list} onSelection={onToTokenChange} />
                                </div>
                                <div className="p-2 pt-0 text-xxs font-semibold">
                                    <p className='ml-2'>{`wallet: ${Number(formatBN(toBalance, toToken.decimals)).toLocaleString()}`}</p>
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
                                        ) : isConnected && account.address ? (
                                            (fromTokenAllowance.gte(fromAmount) && isFromAmountExact) || (fromTokenAllowance.gte(amountInComputed.mul(new BN(100 + allowedSlippage)).div(new BN(100))) && !isFromAmountExact) ? (
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