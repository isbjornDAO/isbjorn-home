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
import { defaultSlippage, QUASI_ADDRESS, sample_token_list, WAVAX_ADDRESS } from '@/constants';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Loader, SlippageInput } from '.';
import { getPairAddress, useHandleConnectWallet } from '@/lib/wallet';
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
            setPercentToRemoveInputValue(value);
            if (value === '') {
                setToken0AmountToRemove(new BN(0));
                setToken1AmountToRemove(new BN(0));
                setIsLoading(false);
                return;
            }
        }
    };

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
                    const newPairBalance = await getUserTokenBal(newPairAddress);
                    setPairAddress(newPairAddress);
                    setPairBalance(newPairBalance);
                }
            }
        };
        handleTokenChanges();
    }, [token0, token1]);

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
                                <div className='flex-1 flex flex-row p-2 items-center'>
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
                                <div className='relative'>
                                    <Separator className='my-4 bg-isbjorn-blue seperator' />
                                    <div
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center text-center justify-center border border-isbjorn-blue"
                                    >
                                        <FaPlus className="text-isbjorn-blue text-lg pt-[1px]" />
                                    </div>
                                </div>
                                <div className='flex-1 flex flex-row p-2 items-center'>
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
                                        className="add-liq-button"
                                        disabled={isWalletLoading || isLoading}>{isWalletLoading || isLoading ? (
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
                                    <div className='flex-1 flex flex-row p-2 items-center'>
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
                                    <div className='relative w-full'>
                                        <Separator className='my-4 bg-isbjorn-blue seperator' />
                                        <div
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center text-center justify-center border border-isbjorn-blue"
                                        >
                                            <FaPlus className="text-isbjorn-blue text-lg pt-[1px]" />
                                        </div>
                                    </div>
                                    <div className='flex-1 flex flex-row p-2 items-center'>
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
                                </div>
                                <div className="w-full flex flex-col gap-1 p-2 items-start justify-center">
                                    <p className="text-xxs ml-[2px]">Percent to remove</p>
                                    <Input
                                        type="number"
                                        placeholder="0.0"
                                        className='text-dodger-blue bg-white no-arrows mr-2'
                                        autoComplete="off"
                                        value={percentToRemoveInputValue}
                                        onChange={(e) => handlePercentToRemoveInputChange(e.target.value)}
                                    />
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
                                        className="remove-liq-button"
                                        disabled={isWalletLoading || isLoading}>{isWalletLoading || isLoading ? (
                                            <Loader />
                                        ) : isConnected && account.address ? (
                                            true ? (
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