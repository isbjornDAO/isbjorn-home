import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectButton, useActiveAccount, useActiveWallet, useDisconnect } from 'thirdweb/react';
import { thirdwebClient } from '@/lib/thirdwebClient';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import Logo from './Logo';
import Footer from './Footer';
import {
  HomeIcon,
  HeartIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MapIcon,
  VideoCameraIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

// Wallet options for thirdweb ConnectButton
const wallets = [
  inAppWallet({
    auth: {
      options: ["email", "google", "apple", "discord"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Donate', href: '/donate', icon: HeartIcon },
    { name: 'Map', href: '/map', icon: MapIcon },
    { name: 'Live', href: '/live', icon: VideoCameraIcon },
    { name: 'Vote', href: '/vote', icon: CheckBadgeIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Handle full logout (both traditional auth and wallet)
  const handleLogout = () => {
    if (activeWallet) {
      disconnect(activeWallet);
    }
    logout();
  };

  // Check if user is connected (either traditional auth or wallet)
  const isConnected = isAuthenticated || !!activeAccount;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-ice-50 to-white">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <nav className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center">
                <Logo size="medium" />
              </Link>

              <div className="hidden md:flex items-center space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${isActive(item.href)
                          ? 'bg-arctic-50 text-arctic-700'
                          : 'text-ice-600 hover:bg-ice-50 hover:text-ice-900'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-1 sm:space-x-3">
                  {/* Profile link */}
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-2 sm:px-4 py-2 rounded-lg text-sm font-medium text-ice-700 hover:bg-ice-50 transition-colors"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">
                      {user?.username || user?.email || (activeAccount?.address ? `${activeAccount.address.slice(0, 6)}...${activeAccount.address.slice(-4)}` : 'Profile')}
                    </span>
                  </Link>

                  {/* Admin link */}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Admin Panel"
                    >
                      <Cog6ToothIcon className="w-5 h-5" />
                    </Link>
                  )}

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-ice-600 hover:bg-ice-50 transition-colors"
                    title="Sign Out"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Thirdweb Connect Button */}
                  {thirdwebClient && (
                    <ConnectButton
                      client={thirdwebClient}
                      wallets={wallets}
                      theme="light"
                      connectButton={{
                        label: "Connect Wallet",
                        className: "!bg-gradient-to-r !from-arctic-500 !to-polar-500 !text-white !text-sm !px-4 !py-2 !rounded-lg !font-medium hover:!from-arctic-600 hover:!to-polar-600 !transition-all !duration-200 !shadow-sm",
                      }}
                      connectModal={{
                        title: "Sign in to Isbjorn",
                        size: "compact",
                        showThirdwebBranding: false,
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;