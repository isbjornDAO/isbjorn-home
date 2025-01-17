import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IggyStakingPanel, LPStakingPanel } from '@/components/shared';

const Staking = () => {
    return (
        <div className="flex flex-col items-center w-full h-full overflow-y-auto">
            <div className="flex flex-col w-4/5 xl:w-3/4 h-full gap-4 items-center mt-[180px] xl:mb-0">
                <IggyStakingPanel />
                <LPStakingPanel />
            </div>
        </div>
    )
}

export default Staking