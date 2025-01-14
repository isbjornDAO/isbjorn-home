import React, { useEffect, useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserContext } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
//import { evmChains, mach1swaptoken_addr_1_map } from '@/constants';
import BN from 'bn.js';
//import { approveIggy, createClaimRewardsTransaction, createDepositTransaction, createWithdrawTransaction } from '@/lib/wallet';
import { formatBN, formatDecimal, scaleToBN } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { Loader } from '@/components/shared';
import { explorer_url, iggy_token_address } from '@/constants';


const IggyStakingPanel = () => {
    const { account, currentChainId, update } = useUserContext();
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [buttonLoading, setButtonLoading] = useState<"deposit" | "claim">("deposit");

    const [amountToDeposit, setAmountToDeposit] = useState<BN>(new BN(0));
    const [amountToWithdraw, setAmountToWithdraw] = useState<BN>(new BN(0));

    const [userBalance, setUserBalance] = useState<BN>(new BN(0));
    const [userDepositBalance, setUserDepositBalance] = useState<BN>(new BN(0));
    const [userAllowance, setUserAllowance] = useState<BN>(new BN(0));
    const [pendingRewards, setPendingRewards] = useState<BN>(new BN(0));

    const [depositButtonDisabled, setDepositButtonDisabled] = useState(true);
    const [withdrawButtonDisabled, setWithdrawButtonDisabled] = useState(true);
    const [claimButtonDisabled, setClaimButtonDisabled] = useState(true);

    const amountToDepositInput = useRef(null);
    const amountToWithdrawInput = useRef(null);

    const setInputValue = (ref, value) => {
        if (ref.current) {
            ref.current.value = value.toString();
        }
    };

    useEffect(() => {
        if (account && account.balances && account.balances[iggy_token_address]) {
            setUserBalance(account.balances[iggy_token_address]);
        } else {
            setUserBalance(new BN(0));
        }
    }, [account.balances]);

    useEffect(() => {
        if (account && account.deposits && account.deposits[iggy_token_address]) {
            setUserDepositBalance(account.deposits[iggy_token_address])
        } else {
            setUserDepositBalance(new BN(0));
        }
    }, [account.deposits]);

    useEffect(() => {
        if (account && account.allowances && account.allowances[iggy_token_address]) {
            setUserAllowance(account.allowances[iggy_token_address])
        } else {
            setUserAllowance(new BN(0));
        }
    }, [account.allowances]);

    // useEffect(() => {
    //     if (userPendingRewards[currentChainId]) {
    //         setPendingRewards(userPendingRewards[currentChainId])
    //     } else {
    //         setPendingRewards(new BN(0));
    //     }
    // }, [userPendingRewards, account, currentChainId]);

    useEffect(() => {
        setDepositButtonDisabled(!(amountToDeposit.gt(new BN(0)) && userBalance.gt(new BN(0)) && amountToDeposit.lte(userBalance)));
    }, [amountToDeposit, userBalance]);

    useEffect(() => {
        setWithdrawButtonDisabled(!(amountToWithdraw.gt(new BN(0)) && userDepositBalance.gt(new BN(0)) && amountToWithdraw.lte(userDepositBalance)));
    }, [amountToWithdraw, userDepositBalance])

    useEffect(() => {
        setClaimButtonDisabled(!(pendingRewards.gt(new BN(0))));
    }, [pendingRewards])

    return (
        <div className='flex flex-col lg:flex-row gap-2 lg:gap-6 items-center justify-start' >
            <div className='flex flex-col gap-2 h-full'>
                <Tabs defaultValue="deposit" className="w-[350px] md:w-[380px] lg:w-[420px] xl:w-[480px] h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-2 gap-1 px-[2px]">
                        <TabsTrigger className="tab-trigger" value="deposit" disabled={isLoading}>Deposit</TabsTrigger>
                        <TabsTrigger className="tab-trigger" value="withdraw" disabled={isLoading}>Withdraw</TabsTrigger>
                    </TabsList>
                    <TabsContent value="deposit" className="flex-1">
                        <div className="flex gap-2 flex-col h-full">
                            <Card className='card w-[350px] md:w-[380px] lg:w-[420px] xl:w-[480px] flex-1'>
                                <CardHeader>
                                    <CardTitle>Deposit</CardTitle>
                                    <CardDescription>
                                        Stake IGGY to earn rewards
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='flex flex-row gap-1 items-center'>
                                        <img
                                            src={"https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dc99fa55b6632e77070b_Isbjorn%20PNG%20(3).png"}
                                            alt='IGGY Token'
                                            className='w-10 h-10 rounded-full mr-1'
                                        />
                                        <div className='flex flex-col gap-1'>
                                            <div className="text-lg">
                                                IGGY
                                            </div>
                                            <div>
                                                {/* <a className='pink-link text-sm' href={evmChains[currentChainId].explorerUrl + "/address/" + mach1swaptoken_addr_1_map[currentChainId]} target="_blank">{evmChains[currentChainId].name}</a> */}
                                            </div>
                                        </div>
                                        <div className='flex flex-col gap-1 w-3/5 ml-auto'>
                                            <div>
                                                <p className='ml-2'>My wallet: <span className='hover:cursor-pointer' onClick={() => { setAmountToDeposit(userBalance); setInputValue(amountToDepositInput, formatBN(userBalance, 18)); }}>{formatDecimal(formatBN(userBalance, 18), 2)}</span> IGGY</p>
                                            </div>
                                            <Input
                                                ref={amountToDepositInput}
                                                type="number"
                                                placeholder="0.0"
                                                className='text-white bg-dark-2 border-dark-4 no-arrows'
                                                autoComplete="off"
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (!isNaN(Number(value)) && Number(value) >= 0 && value !== "") {
                                                        setAmountToDeposit(scaleToBN(value, 18));
                                                    } else {
                                                        setAmountToDeposit(new BN(0));
                                                    }
                                                }}

                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                </CardFooter>
                            </Card>
                            <Button
                                className="shad-button_primary w-[350px] md:w-[380px] lg:w-[420px] xl:w-[480px] mt-2"
                                disabled={depositButtonDisabled || isLoading}
                                onClick={async () => {
                                    setButtonLoading("deposit");
                                    setIsLoading(true);
                                    let result;
                                    // if (userAllowance.lt(amountToDeposit)) {
                                    //     let approvalResult = await approveIggy(currentChainId, account.address, amountToDeposit);
                                    //     if (approvalResult.success) {
                                    //         result = await createDepositTransaction(currentChainId, account.address, amountToDeposit);
                                    //     }
                                    // } else {
                                    //     result = await createDepositTransaction(currentChainId, account.address, amountToDeposit);
                                    // }
                                    if (result?.success) {
                                        showToast("Successfully deposited IGGY", 'success', explorer_url + "/tx/" + result.txHash);
                                    } else {
                                        showToast("Error depositing IGGY", "error", result?.txHash !== undefined ? explorer_url + "/tx/" + result.txHash : undefined);
                                    }
                                    setIsLoading(false);
                                    setAmountToDeposit(new BN(0));
                                    setInputValue(amountToDepositInput, '');
                                    update();
                                }}>{isLoading && buttonLoading === "deposit" ? <Loader height={32} width={32} /> : "Deposit"}</Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="withdraw" className="flex-1">
                        <div className="flex gap-2 flex-col h-full">
                            <Card className='card w-[350px] md:w-[380px] lg:w-[420px] xl:w-[480px] flex-1'>
                                <CardHeader>
                                    <CardTitle>Withdraw</CardTitle>
                                    <CardDescription>
                                        Withdraw your deposited IGGY
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='flex flex-row gap-1 items-center'>
                                        <img
                                            src={"https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dc99fa55b6632e77070b_Isbjorn%20PNG%20(3).png"}
                                            alt='IGGY Token'
                                            className='w-10 h-10 rounded-full mr-1'
                                        />
                                        <div className='flex flex-col gap-1'>
                                            <div className="text-lg">
                                                IGGY
                                            </div>
                                            <div>
                                                {/* <a className='pink-link text-sm' href={evmChains[currentChainId].explorerUrl + "/address/" + mach1swaptoken_addr_1_map[currentChainId]} target="_blank">{evmChains[currentChainId].name}</a> */}
                                            </div>
                                        </div>
                                        <div className='flex flex-col gap-1 w-3/5 ml-auto'>
                                            <div>
                                                <p className='ml-2'>My deposits: <span className='hover:cursor-pointer' onClick={() => { setAmountToWithdraw(userDepositBalance); setInputValue(amountToWithdrawInput, formatBN(userDepositBalance, 18)); }}>{formatDecimal(formatBN(userDepositBalance, 18), 2)}</span> IGGY</p>
                                            </div>
                                            <Input
                                                ref={amountToWithdrawInput}
                                                type="number"
                                                placeholder="0.0"
                                                className='text-white bg-dark-2 border-dark-4 no-arrows'
                                                autoComplete="off"
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (!isNaN(Number(value)) && Number(value) >= 0 && value !== "") {
                                                        setAmountToWithdraw(scaleToBN(value, 18));
                                                    } else {
                                                        setAmountToWithdraw(new BN("0"));
                                                    }
                                                }}

                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                </CardFooter>
                            </Card>
                            <Button
                                className="shad-button_primary w-[350px] md:w-[380px] lg:w-[420px] xl:w-[480px] mt-2"
                                disabled={withdrawButtonDisabled || isLoading}
                                onClick={async () => {
                                    setButtonLoading("deposit");
                                    setIsLoading(true);
                                    let result = ''; //await createWithdrawTransaction(currentChainId, account.address, amountToWithdraw);
                                    // if (result.success) {
                                    //     showToast("Successfully withdrew IGGY", 'success', explorer_url + "/tx/" + result.txHash);
                                    // } else {
                                    //     showToast("Error withdrawing IGGY", "error", result?.txHash !== undefined ? explorer_url + "/tx/" + result.txHash : undefined);
                                    // }
                                    setIsLoading(false);
                                    setAmountToWithdraw(new BN(0));
                                    setInputValue(amountToWithdrawInput, '');
                                    update();
                                }}>{isLoading && buttonLoading === "deposit" ? <Loader height={32} width={32} /> : "Withdraw"}</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <div className='flex flex-col gap-2'>
                <Card className='card w-[350px] md:w-[380px] lg:w-[420px] xl:w-[480px] mt-2'>
                    <CardHeader>
                        <CardTitle>Staked Balance</CardTitle>
                        <CardDescription></CardDescription>
                        <CardContent>
                            <div className='flex flex-row gap-3 justify-start items-center'>
                                <img
                                    src={"https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dc99fa55b6632e77070b_Isbjorn%20PNG%20(3).png"}
                                    alt='IGGY Token'
                                    className='w-12 h-12 rounded-full mr-1'
                                />
                                <div className='text-lg'>{formatDecimal(formatBN(userDepositBalance, 18), 2)} IGGY</div>
                            </div>
                        </CardContent>
                    </CardHeader>
                </Card>
                <Card className='card w-[350px] md:w-[380px] lg:w-[420px] xl:w-[480px]'>
                    <CardHeader>
                        <CardTitle>Pending Rewards</CardTitle>
                        <CardDescription></CardDescription>
                        <CardContent>
                            <div className='flex flex-row gap-3 justify-start items-center'>
                                <img
                                    src={`/assets/images/tokens.png`}
                                    alt={"REWARDS"}
                                    className='w-12 h-12 rounded-full mr-1'
                                />
                                <div className='text-lg'>{formatDecimal(formatBN(pendingRewards, 18), 5)} {"REWARDS"}</div>
                            </div>
                        </CardContent>
                    </CardHeader>
                </Card>
                <Button
                    className="shad-button_primary w-[350px] md:w-[380px] lg:w-[420px] xl:w-[480px] mt-2"
                    disabled={claimButtonDisabled || isLoading}
                    onClick={async () => {
                        setButtonLoading("claim");
                        setIsLoading(true);
                        let result = ''; //await createClaimRewardsTransaction(currentChainId, account.address);
                        // if (result.success) {
                        //     showToast("Successfully claimed rewards", 'success', evmChains[currentChainId].explorerUrl + "/tx/" + result.txHash);
                        // } else {
                        //     showToast("Error claiming rewards", "error", result?.txHash !== undefined ? evmChains[currentChainId].explorerUrl + "/tx/" + result.txHash : undefined);
                        // }
                        setIsLoading(false);
                        update();
                    }}>{isLoading && buttonLoading === "claim" ? <Loader height={32} width={32} /> : "Claim Rewards"}</Button>
            </div>

        </div>
    )
}

export default IggyStakingPanel