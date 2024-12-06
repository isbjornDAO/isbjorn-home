import React, { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/context/ToastContext';
import { useUserContext } from '@/context/AuthContext';
import { Input } from '../ui/input';
import TokenChooser from './TokenChooser';
import { FaPlus } from 'react-icons/fa';
import { Separator } from '../ui/separator';
import { Token } from '@/types';
import { defaultSlippage, explorer_url, QUASI_ADDRESS, Router_address, sample_token_list, WAVAX_ADDRESS } from '@/constants';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Loader, SlippageInput } from '.';
import { approveERC20Amount, createRemoveLiquidityTransaction, getERC20Allowance, getPairAddress, getTokenAmountsOnRemoveLiquidity, initializeWeb3, useHandleConnectWallet } from '@/lib/wallet';
import BN from 'bn.js';
import { formatBN } from '@/lib/utils';

const LiquidityPanel = () => {
    const { account, isConnected, getUserTokenBal } = useUserContext();
    const { handleConnectWallet, isWalletLoading } = useHandleConnectWallet();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [token0, setToken0] = useState<Token>(sample_token_list[WAVAX_ADDRESS]);
    const [token1, setToken1] = useState<Token>(sample_token_list[QUASI_ADDRESS]);

    const [token0Amount, setToken0Amount] = useState<BN>(new BN(0));
    const [token1Amount, setToken1Amount] = useState<BN>(new BN(0));

    const [token0Balance, setToken0Balance] = useState<BN>(new BN(0));
    const [token1Balance, setToken1Balance] = useState<BN>(new BN(0));

    const [token0InputValue, setToken0InputValue] = useState<string>('');
    const [token1InputValue, setToken1InputValue] = useState<string>('');

    const [lastToken0, setLastToken0] = useState<Token>(token0);
    const [lastToken1, setLastToken1] = useState<Token>(token1);

    const [wasToken0LastChanged, setWasToken0LastChanged] = useState<boolean>(true);

    const [percentToRemove, setPercentToRemove] = useState<number>(0);
    const [percentToRemoveInputValue, setPercentToRemoveInputValue] = useState<string>('');

    const [token0AmountToRemove, setToken0AmountToRemove] = useState<BN>(new BN(0));
    const [token1AmountToRemove, setToken1AmountToRemove] = useState<BN>(new BN(0));

    const [allowedSlippage, setAllowedSlippage] = useState<number>(defaultSlippage);
    const [safeModeEnabled, setSafeModeEnabled] = useState<boolean>(true);

    const [pairAddress, setPairAddress] = useState<string>('');
    const [pairBalance, setPairBalance] = useState<BN>(new BN(0));
    const [redeemLPAllowance, setRedeemLPAllowance] = useState<BN>(new BN(0));

    const onToken0Change = (value: Token) => {
        setLastToken0(token0);
        setToken0(value);
        setWasToken0LastChanged(true);
    }

    const onToken1Change = (value: Token) => {
        setLastToken1(token1);
        setToken1(value);
        setWasToken0LastChanged(false);
    };

    const handleToken0InputChange = (value: string) => {
        setIsLoading(true);
        if (!isNaN(Number(value)) || value === '') {
            setToken0InputValue(value);
            if (value === '') {
                setToken0Amount(new BN(0));
                setToken1InputValue('');
                setIsLoading(false);
                return;
            }
        }
    };

    const handleToken1InputChange = (value: string) => {
        setIsLoading(true);
        if (!isNaN(Number(value)) || value === '') {
            setToken1InputValue(value);
            if (value === '') {
                setToken1Amount(new BN(0));
                setToken0InputValue('');
                setIsLoading(false);
                return;
            }
        }
    };

    const handlePercentToRemoveInputChange = (value: string) => {
        setIsLoading(true);
        if (!isNaN(Number(value)) || value === '') {
            if (value === '') {
                setPercentToRemoveInputValue(value);
            } else {
                const numValue = Number(value);
                if (numValue > 100) {
                    setPercentToRemoveInputValue("100");
                    setPercentToRemove(100);
                } else if (numValue < 0) {
                    setPercentToRemoveInputValue("0.1");
                    setPercentToRemove(0.1);
                } else {
                    setPercentToRemoveInputValue(value);
                    setPercentToRemove(numValue);
                }
            }
            if (value === '') {
                setToken0AmountToRemove(new BN(0));
                setToken1AmountToRemove(new BN(0));
                setIsLoading(false);
                return;
            }
        }
    };

    const clearPanel = () => {

    };


    const handleAddLiqButtonClick = async () => { };
    const handleRemoveLiqButtonClick = async () => {
        const amountToRemove = pairBalance.mul(new BN(percentToRemove)).div(new BN(100));
        if (redeemLPAllowance.gte(amountToRemove)) {
            if (amountToRemove.isZero()) {
                return;
            }
            setIsLoading(true);
            const result = await createRemoveLiquidityTransaction(account.address, token0.address, token1.address, amountToRemove, token0AmountToRemove, token1AmountToRemove, allowedSlippage);
            if (result.success) {
                showToast("Liquidity Removed", "success", explorer_url + "/tx/" + result.txHash);
                clearPanel();
            } else {
                showToast("Failed to Remove Liquidity", "error", result?.txHash ? (explorer_url + "/tx/" + result.txHash) : undefined);
            }
        } else {
            setIsLoading(true);
            const result = await approveERC20Amount(account.address, Router_address, pairAddress, amountToRemove);
            if (result.success) {
                showToast("Approved LP tokens for remove", "success", explorer_url + "/tx/" + result.txHash);
                setRedeemLPAllowance(amountToRemove);
            } else {
                showToast("Failed to approve LP tokens", "error", result?.txHash ? (explorer_url + "/tx/" + result.txHash) : undefined);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const getInitialPair = async () => {
            const newPairAddress = await getPairAddress(token0.address, token1.address);
            console.log(newPairAddress);
            if (newPairAddress) {
                setPairAddress(newPairAddress);
            }
        }
        getInitialPair();
    }, []);

    useEffect(() => {
        const getPairBal = async () => {
            if (pairAddress !== '') {
                const newPairBalance = await getUserTokenBal(pairAddress);
                if (newPairBalance !== null) {
                    setPairBalance(newPairBalance);
                } else {
                    setPairBalance(new BN(0));
                }
            }
        }
        const getPairAllowance = async () => {
            if (pairAddress !== '') {
                const newPairAllowance = await getERC20Allowance(account.address, Router_address, pairAddress);
                if (newPairAllowance !== null) {
                    setRedeemLPAllowance(newPairAllowance);
                } else {
                    setRedeemLPAllowance(new BN(0));
                }
            }
        };
        getPairBal();
        getPairAllowance();
    }, [pairAddress]);

    useEffect(() => {
        const handleTokenChanges = async () => {
            // if to or from token changed to same token, force update using last token
            if (token0 === token1) {
                if (wasToken0LastChanged) {
                    setLastToken1(token1);
                    setToken1(lastToken0);
                } else {
                    setLastToken0(token0);
                    setToken0(lastToken1);
                }
            } else {
                const newPairAddress = await getPairAddress(token0.address, token1.address);
                console.log(newPairAddress);
                if (newPairAddress) {
                    setPairAddress(newPairAddress);
                }
            }
        };
        handleTokenChanges();
    }, [token0, token1]);

    useEffect(() => {
        const handlePercentChange = async () => {
            if (percentToRemove > 0) {
                const token0Address = token0.address === "0xAVAX" ? WAVAX_ADDRESS : token0.address;
                const token1Address = token1.address === "0xAVAX" ? WAVAX_ADDRESS : token1.address;
                const liquidityToRemove = pairBalance.mul(new BN(percentToRemove)).div(new BN(100));
                const amounts = await getTokenAmountsOnRemoveLiquidity(token0Address, token1Address, liquidityToRemove);
                if (token0Address > token1Address) {
                    setToken0AmountToRemove(amounts[0]);
                    setToken1AmountToRemove(amounts[1]);
                } else {
                    setToken0AmountToRemove(amounts[1]);
                    setToken1AmountToRemove(amounts[0]);
                }
                setIsLoading(false);
            }
        };
        handlePercentChange();
    }, [percentToRemove, token0, token1]);

    useEffect(() => {
        if (account.balances) {
            if (account.balances[token0.address.toLowerCase()]) {
                setToken0Balance(account.balances[token0.address.toLowerCase()]);
            }
        }
    }, [token0, account.balances]);

    useEffect(() => {
        if (account.balances) {
            if (account.balances[token1.address.toLowerCase()]) {
                setToken1Balance(account.balances[token1.address.toLowerCase()]);
            }
        }
    }, [token1, account.balances]);

    return (
        <Tabs defaultValue="add" className="w-[640px]">
            <TabsList className="grid w-full grid-cols-2 gap-1 px-[2px]">
                <TabsTrigger className="tab-trigger" value="add" disabled={isLoading}>Add</TabsTrigger>
                <TabsTrigger className="tab-trigger" value="remove" disabled={isLoading}>Remove</TabsTrigger>
            </TabsList>
            <TabsContent value="add">
                <Card className="card w-[640px]">
                    <CardHeader>
                        <CardTitle>Add Liquidity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full flex flex-row">
                            <div className="flex-1 text-center flex flex-col">
                                <div className='flex-1'></div>
                                STATS HERE
                                <div className='flex-1'></div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className='flex-1 flex flex-row p-2 pb-0 items-center'>
                                    <Input
                                        type="number"
                                        placeholder="0.0"
                                        className='text-dodger-blue bg-white no-arrows mr-2'
                                        autoComplete="off"
                                        value={token0InputValue}
                                        onChange={(e) => handleToken0InputChange(e.target.value)}
                                    />
                                    <TokenChooser startSelected={token0} available={sample_token_list} onSelection={onToken0Change} />
                                </div>
                                <div className="p-2 pt-0 text-xxs font-semibold hover:cursor-pointer">
                                    <p
                                        onClick={() => {
                                            setToken0Amount(token0Balance);
                                            setToken0InputValue(formatBN(token0Balance, token0.decimals));
                                        }}
                                        className='ml-2'>{`wallet: ${Number(formatBN(token0Balance, token0.decimals)).toLocaleString()}`}</p>
                                </div>
                                <div className='relative'>
                                    <Separator className='my-4 bg-isbjorn-blue seperator' />
                                    <div
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center text-center justify-center border border-isbjorn-blue"
                                    >
                                        <FaPlus className="text-isbjorn-blue text-lg pt-[1px]" />
                                    </div>
                                </div>
                                <div className='flex-1 flex flex-row p-2 pb-0 items-center'>
                                    <Input
                                        type="number"
                                        placeholder="0.0"
                                        className='text-dodger-blue bg-white no-arrows mr-2'
                                        autoComplete="off"
                                        value={token1InputValue}
                                        onChange={(e) => handleToken1InputChange(e.target.value)}
                                    />
                                    <TokenChooser startSelected={token1} available={sample_token_list} onSelection={onToken1Change} />
                                </div>
                                <div className="p-2 pt-0 text-xxs font-semibold hover:cursor-pointer">
                                    <p
                                        onClick={() => {
                                            setToken1Amount(token1Balance);
                                            setToken1InputValue(formatBN(token1Balance, token1.decimals));
                                        }}
                                        className='ml-2'>{`wallet: ${Number(formatBN(token1Balance, token1.decimals)).toLocaleString()}`}</p>
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
                                        className="add-liq-button"
                                        onClick={() => {
                                            if (isConnected) {
                                                handleAddLiqButtonClick();
                                            } else {
                                                handleConnectWallet();
                                            }
                                        }}>{isWalletLoading || isLoading ? (
                                            <Loader />
                                        ) : isConnected && account.address ? (
                                            true ? (
                                                "Add Liquidty"
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
            </TabsContent>
            <TabsContent value="remove">
                <Card className="card w-[640px]">
                    <CardHeader>
                        <CardTitle>Remove Liquidity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full flex flex-row">
                            <div className="flex-1 text-center flex flex-col">
                                <div className='flex-1'></div>
                                SAME STATS HERE
                                <div className='flex-1'></div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="flex-1 flex flex-col items-center ">
                                    <div className='flex-1 flex flex-row p-2 pb-0 items-center'>
                                        <Input
                                            disabled={true}
                                            type="number"
                                            placeholder="0.0"
                                            className='text-dodger-blue bg-white no-arrows mr-2'
                                            autoComplete="off"
                                            value={token0AmountToRemove.isZero() ? '' : formatBN(token0AmountToRemove, token0.decimals)}
                                        />
                                        <TokenChooser startSelected={token0} available={sample_token_list} onSelection={onToken0Change} />
                                    </div>
                                    <div className="p-2 pt-0 text-xxs font-semibold hover:cursor-pointer w-full">
                                        <p className='ml-2'>{`wallet: ${Number(formatBN(token0Balance, token0.decimals)).toLocaleString()}`}</p>
                                    </div>
                                    <div className='relative w-full'>
                                        <Separator className='my-4 bg-isbjorn-blue seperator' />
                                        <div
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center text-center justify-center border border-isbjorn-blue"
                                        >
                                            <FaPlus className="text-isbjorn-blue text-lg pt-[1px]" />
                                        </div>
                                    </div>
                                    <div className='flex-1 flex flex-row p-2 pb-0 items-center'>
                                        <Input
                                            disabled={true}
                                            type="number"
                                            placeholder="0.0"
                                            className='text-dodger-blue bg-white no-arrows mr-2'
                                            autoComplete="off"
                                            value={token1AmountToRemove.isZero() ? '' : formatBN(token1AmountToRemove, token1.decimals)}
                                        />
                                        <TokenChooser startSelected={token1} available={sample_token_list} onSelection={onToken1Change} />
                                    </div>
                                    <div className="p-2 pt-0 text-xxs font-semibold hover:cursor-pointer  w-full">
                                        <p className='ml-2'>{`wallet: ${Number(formatBN(token1Balance, token1.decimals)).toLocaleString()}`}</p>
                                    </div>
                                </div>
                                <div className="w-full flex flex-col gap-1 p-2 pb-0 items-start justify-center">
                                    <p className="text-xxs ml-[2px]">Percent to remove</p>
                                    <Input
                                        type="number"
                                        placeholder="0.0%"
                                        className='text-dodger-blue bg-white no-arrows mr-2'
                                        autoComplete="off"
                                        value={percentToRemoveInputValue}
                                        onChange={(e) => handlePercentToRemoveInputChange(e.target.value)}
                                    />
                                </div>
                                <div className="p-2 pt-[1px] text-xxs font-semibold hover:cursor-pointer">
                                    <p
                                        onClick={() => {
                                            setPercentToRemove(100);
                                            setPercentToRemoveInputValue("100");
                                        }}
                                        className='ml-2'>{`wallet: ${Number(formatBN(pairBalance, 18)).toLocaleString()}`}
                                    </p>
                                </div>
                                <div className='flex-1 p-2 flex flex-row justify-between'>
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
                                        className="remove-liq-button"
                                        onClick={() => {
                                            if (isConnected) {
                                                handleRemoveLiqButtonClick();
                                            } else {
                                                handleConnectWallet();
                                            }
                                        }}>{isWalletLoading || isLoading ? (
                                            <Loader />
                                        ) : isConnected && account.address ? (
                                            redeemLPAllowance.gte(pairBalance.mul(new BN(percentToRemove)).div(new BN(100))) ? (
                                                "Remove Liquidty"
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
            </TabsContent>
        </Tabs>
    )
}

export default LiquidityPanel