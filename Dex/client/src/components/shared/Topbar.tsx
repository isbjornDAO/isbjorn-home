import { isbjorn_head_logo_url, main_site_url } from '@/constants';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ProfileCard } from '@/components/shared';

const articLabel = "Artic";
const articRoute = "/artic";

const collectLabel = "Collect";
const collectRoute = "/collect";

const initiativesLabel = "Initiatives";
const initiativesRoute = "/initiatives";

const swapLabel = "Swap";
const swapRoute = "/swap";

const Topbar = () => {
    const { pathname } = useLocation();

    return (
        <section className='topbar'>
            <div className='flex flex-row gap-10 py-4 px-3 justify-center w-full'>
                <ul className='flex flex-row gap-8 ml-2'>
                    <li
                        key={swapLabel}
                        className={`flex text-center items-center justify-center text-gray text-sm  hover:text-white group ${(pathname === swapRoute || pathname === "/") && "underline"}`}
                    >
                        <NavLink
                            to={swapRoute}
                        >
                            {swapLabel}
                        </NavLink>

                    </li>
                    <li
                        key={collectLabel}
                        className={`flex text-center items-center justify-center text-gray text-sm  hover:text-white group ${pathname === collectRoute && "underline"}`}
                    >
                        <NavLink
                            to={collectRoute}
                        >
                            {collectLabel}
                        </NavLink>

                    </li>
                </ul>
                <a
                    href={main_site_url}
                    target="_blank"
                    className='flex gap-1 items-center'>
                    <img
                        src={isbjorn_head_logo_url}
                        alt='logo'
                        width={100}
                        height={36}
                    />
                </a>
                <ul className='flex flex-row gap-8 ml-2'>
                    <li
                        key={articLabel}
                        className={`flex text-center items-center justify-center text-gray text-sm  hover:text-white group ${pathname === articRoute && "underline"}`}
                    >
                        <NavLink
                            to={articRoute}
                        >
                            {articLabel}
                        </NavLink>

                    </li>
                    <li
                        key={initiativesLabel}
                        className={`flex text-center items-center justify-center text-gray text-sm  hover:text-white group ${pathname === initiativesRoute && "underline"}`}
                    >
                        <NavLink
                            to={initiativesRoute}
                        >
                            {initiativesLabel}
                        </NavLink>

                    </li>
                </ul>
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <ProfileCard />
            </div>
        </section>
    )
}

export default Topbar