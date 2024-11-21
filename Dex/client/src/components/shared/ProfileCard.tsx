import { useUserContext } from '@/context/AuthContext'
import { useHandleConnectWallet } from "@/lib/wallet";
import { shortenAddress } from '@/lib/utils';
import React from 'react'
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/shared';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const ProfileCard = () => {

    const { account, isConnected } = useUserContext();
    const { handleConnectWallet, isLoading } = useHandleConnectWallet();
    return (

        !isConnected
            ? (
                <div className='flex flex-row gap-1 items-center justify-center'>
                    <Button
                        className="profile-card-connect-button subtle-semibold px-2 py-0 h-8"
                        onClick={() => handleConnectWallet()}>
                        {isLoading && !isConnected
                            ? (
                                <Loader />
                            )
                            : (
                                "Connect"
                            )
                        }
                    </Button>
                </div>
            )
            : (
                <div className='flex flex-row gap-1 items-center justify-center'>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    className="profile-card-connect-button subtle-semibold px-2 py-0 h-8">
                                    {account.name ? account.name : shortenAddress(account.address, 6)}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className='profile-tooltip mr-2 text-xxs font-mono font-semibold'>
                                <p>{account.address}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )
    )
}

export default ProfileCard