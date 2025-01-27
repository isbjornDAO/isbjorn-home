import { useUserContext } from '@/context/AuthContext';
import { LPToken } from '@/types'
import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom';

interface LPStakePoolProps {
    token: LPToken;
}

const LPStakePool: FC<LPStakePoolProps> = ({ token }) => {
    if (token === null) {
        return (
            <div className="bg-gray-200 p-4 rounded animate-pulse h-[76px]">

            </div>)
    }

    const { account, isConnected, tokenList, update, refresh } = useUserContext();
    const navigate = useNavigate();

    const token0Address = token.addresses[0];
    const token1Address = token.addresses[1];
    const token0 = tokenList[token0Address.toLowerCase()];
    const token1 = tokenList[token1Address.toLowerCase()];


    const handleClick = () => {
        navigate(`/stake/${token.token}`);
    }

    return (
        <div className='bg-gray-200 p-4 rounded flex flex-col gap-1 hover:cursor-pointer'
            onClick={handleClick}>
            <div className='w-full flex flex-row gap-2 items-center justify-center'>
                <div className='flex flex-row'>
                    <img
                        src={token0.imgUrl}
                        alt={`${token0.ticker} Token`}
                        className='w-10 h-10 rounded-full z-10'
                    />
                    <img
                        src={token1.imgUrl}
                        alt={`${token1.ticker} Token`}
                        className='w-10 h-10 rounded-full -ml-2'
                    />
                </div>
                <div className="flex text-center items-center justify-center ml-2 font-semibold">
                    {`${token0.ticker}-${token1.ticker}`}
                </div>
            </div>
            <div>

            </div>
        </div>
    );
}

export default LPStakePool