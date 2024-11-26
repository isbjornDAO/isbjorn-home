import React, { useEffect, useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader, SlippageInput, TokenChooser } from '@/components/shared';
import { Separator } from '@/components/ui/separator';
import { Switch } from "@/components/ui/switch"
import BN from 'bn.js';
import { defaultSlippage, QUASI_ADDRESS, safeModeEnabledMaxSlippage, sample_token_list, WAVAX_ADDRESS } from '@/constants';
import { Token } from '@/types';
import { useUserContext } from '@/context/AuthContext';
import { useHandleConnectWallet } from '@/lib/wallet';


const SwapPanel = () => {

    const { account, isConnected } = useUserContext();
    const { handleConnectWallet, isLoading } = useHandleConnectWallet();

    const [fromToken, setFromToken] = useState<Token>(sample_token_list[WAVAX_ADDRESS]);
    const [lastFromToken, setLastFromToken] = useState<Token>(fromToken);
    const [fromAmount, setFromAmount] = useState();

    const [toToken, setToToken] = useState<Token>(sample_token_list[QUASI_ADDRESS]);
    const [lastToToken, setLastToToken] = useState<Token>(toToken);
    const [toAmount, setToAmount] = useState();

    const [wasFromLastChanged, setWasFromLastChanged] = useState<boolean>(true);

    const [isChartLoaded, setIsChartLoaded] = useState<boolean>(false);

    const [allowedSlippage, setAllowedSlippage] = useState<number>(defaultSlippage);
    const [safeModeEnabled, setSafeModeEnabled] = useState<boolean>(true);



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

    const handleSwap = () => {
        console.log("Swap");
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
                                    />
                                    <TokenChooser startSelected={toToken} available={sample_token_list} onSelection={onToTokenChange} />
                                </div>
                                <div className='w-full p-2 flex flex-row justify-between'>
                                    <div className='flex flex-row'>
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
                                    <Button className="swap-button" onClick={() => {
                                        if (isConnected) {
                                            handleSwap();
                                        } else {
                                            handleConnectWallet();
                                        }
                                    }}>{isLoading && !isConnected ? (
                                        <Loader />
                                    ) : account.address ? (
                                        "Swap"
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