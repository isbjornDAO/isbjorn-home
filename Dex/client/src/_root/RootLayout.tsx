
import { Topbar } from '@/components/shared';
import { Outlet } from 'react-router-dom';

const RootLayout = () => {
    return (
        <div className="w-full flex flex-col overflow-hidden">
            <Topbar />
            <section className="flex flex-1 h-full overflow-auto">
                <Outlet />
            </section>
        </div>
    );
}

export default RootLayout