import { LiquidityPanel } from '@/components/shared';

const ManageLiq = () => {
    return (
        <div className="flex flex-col items-center w-full h-full overflow-y-auto">
            <div className="flex flex-col w-4/5 xl:w-3/4 h-full gap-4 items-center mt-[180px] xl:mb-0">
                <LiquidityPanel />
            </div>
        </div>
    )
}

export default ManageLiq