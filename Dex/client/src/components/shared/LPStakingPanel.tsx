import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getStakableTokens, getTokenAddressesFromPair } from '@/lib/wallet';
import { useToast } from '@/context/ToastContext';
import { useUserContext } from '@/context/AuthContext';
import LPStakePool from './LPStakePool';
import { LPToken } from '@/types';



const LPStakingPanel = () => {
    const { account, getUserTokenBal, update, refresh } = useUserContext();
    const { showToast } = useToast();

    const [currentEpoch, setCurrentEpoch] = useState<number>(0);
    const [timeToCurrentEpochEnd, setTimeToCurrentEpochEnd] = useState<string>('NA');
    const [stakableTokens, setStakableTokens] = useState<string[]>([]);
    const [tokenPairs, setTokenPairs] = useState<LPToken[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const getStakableTokenList = async () => {
            const stakableTokenList = await getStakableTokens();
            if (stakableTokenList !== null) {
                setStakableTokens(stakableTokenList);
            } else {
                setStakableTokens([]);
            }
        }
        getStakableTokenList();
    }, [refresh]);

    useEffect(() => {
        const fetchTokenPairs = async () => {
            try {
                setLoading(true);
                const pairs = await Promise.all(
                    stakableTokens.map(async (token) => ({
                        token,
                        addresses: await getTokenAddressesFromPair(token)
                    }))
                );
                setTokenPairs(pairs);
            } catch (error) {
                console.error('Error fetching token pairs:', error);
            } finally {
                setLoading(false);
            }
        };

        if (stakableTokens.length > 0) {
            fetchTokenPairs();
        }
    }, [stakableTokens]);

    return (
        <div className="w-[350px] md:w-[380px] lg:w-[864px] xl:w-[984px] mt-10">
            <div className='w-full flex flex-row justify-between p-1 text-sm font-semibold'>
                <div>{`Epoch: ${currentEpoch}`}</div>
                <div>{`Epoch ends in: ${timeToCurrentEpochEnd}`}</div>
            </div>
            <Card className='card'>
                <CardHeader>
                    <CardTitle>LP Staking</CardTitle>
                    <CardDescription>
                        Stake LP tokens to earn rewards
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='w-full grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4'>
                        {loading ? (
                            // Loading skeletons
                            Array(stakableTokens.length).fill(0).map((_, index) => (
                                <LPStakePool token={null} key={`skeleton-${Math.floor(Math.random() * 1000000)}`} />
                            ))
                        ) : (
                            tokenPairs.map((token) => (
                                <LPStakePool token={token} key={token.token} />
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default LPStakingPanel