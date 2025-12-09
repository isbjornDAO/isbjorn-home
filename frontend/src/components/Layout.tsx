import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';
import Footer from './Footer';
import {
  HomeIcon,
  HeartIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  LinkIcon,
  CurrencyDollarIcon,
  MapIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Donate', href: '/donate', icon: HeartIcon },
    { name: 'Impact Map', href: '/map', icon: MapIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-ice-50 to-white">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Logo size="medium" />
              </Link>

              <div className="hidden md:flex items-center space-x-1 ml-10">
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
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-1 sm:space-x-3">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-2 sm:px-4 py-2 rounded-lg text-sm font-medium text-ice-700 hover:bg-ice-50 transition-colors"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">{user.companyName}</span>
                  </Link>

                  <Link
                    to="/wallet"
                    className="p-2 rounded-lg text-ice-600 hover:bg-ice-50 transition-colors"
                    title="My Wallet"
                  >
                    <CurrencyDollarIcon className="w-5 h-5" />
                  </Link>

                  <Link
                    to="/integrations"
                    className="p-2 rounded-lg text-ice-600 hover:bg-ice-50 transition-colors"
                    title="Accounting Integrations"
                  >
                    <LinkIcon className="w-5 h-5" />
                  </Link>

                  <Link
                    to="/profile"
                    className="p-2 rounded-lg text-ice-600 hover:bg-ice-50 transition-colors"
                    title="Profile Settings"
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Admin Panel"
                    >
                      <Cog6ToothIcon className="w-5 h-5" />
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="p-2 rounded-lg text-ice-600 hover:bg-ice-50 transition-colors"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Link
                    to="/login"
                    className="hidden sm:block px-4 py-2 text-sm font-medium text-ice-700 hover:text-ice-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/donate"
                    className="btn-primary text-sm px-3 sm:px-6 py-2 sm:py-3"
                  >
                    <span className="hidden sm:inline">Donate now</span>
                    <span className="sm:hidden">Donate now</span>
                  </Link>
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