import { SwapPanel } from '@/components/shared';
import React from 'react';

const Swap = () => {
    return (
        <div className="flex flex-col items-center w-full h-full overflow-y-auto">
            <div className="flex flex-col w-4/5 xl:w-3/4 h-full gap-4 items-center mt-[180px] xl:mb-0">
                <SwapPanel />
            </div>
        </div>
    )
};

export default Swap;