import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import polarBearBg from '@/assets/polar-bears-swimming.jpg';

type AccountType = 'individual' | 'business';

const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>('individual');
  const [formData, setFormData] = useState({
    name: '', // Maps to companyName
    nzbn: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) {
      newErrors.name = accountType === 'business' ? 'Company name is required' : 'Full name is required';
    }

    if (accountType === 'business' && !formData.nzbn) {
      if (!formData.nzbn) newErrors.nzbn = 'Business number is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register({
        companyName: formData.name, // Mapping Full Name to Company Name field
        nzbn: accountType === 'business' ? formData.nzbn : undefined,
        email: formData.email,
        password: formData.password,
      });
    } catch (error) {
      // Error is handled in AuthContext with toast
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Curved Banner at Top */}
      <div
        className="relative w-full h-72 overflow-hidden"
        style={{
          borderBottomLeftRadius: '50% 15%',
          borderBottomRightRadius: '50% 15%',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${polarBearBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-arctic-500/20 to-arctic-600/30" />
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 -mt-40 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full mb-2 shadow-lg"
          >
            <span className="text-2xl">🐻‍❄️</span>
          </motion.div>
          <h1 className="text-xl font-bold text-gray-800 font-display mb-1">Create an Account</h1>
          <p className="text-sm text-ice-600">Join Isbjorn today</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-ice-100 overflow-hidden p-6">

          {/* Social Sign Up Options */}
          <div className="mb-4">
            <p className="text-center text-sm text-gray-600 mb-3">Choose your preferred sign-up method</p>

            <div className="space-y-2">
              {/* Google */}
              <button
                type="button"
                onClick={() => toast('Google sign-up coming soon!', { icon: '🔜' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* Proton */}
              <button
                type="button"
                onClick={() => toast('Proton sign-up coming soon!', { icon: '🔜' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#6D4AFF"/>
                  <path d="M16 8L8 20h5.33L16 24l8-12h-5.33L16 8z" fill="white"/>
                </svg>
                Continue with Proton
              </button>

              {/* X (Twitter) */}
              <button
                type="button"
                onClick={() => toast('X sign-up coming soon!', { icon: '🔜' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Continue with X
              </button>

              {/* Wallet */}
              <button
                type="button"
                onClick={() => toast('Wallet sign-up coming soon!', { icon: '🔜' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="6" width="18" height="13" rx="2"/>
                  <path d="M3 10h18"/>
                  <path d="M7 15h.01M11 15h2"/>
                </svg>
                Continue with Wallet
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">or continue with email</span>
              </div>
            </div>
          </div>

          {/* Account Type Slider */}
          <div className="bg-ice-50 p-1 rounded-xl flex items-center mb-6 relative">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-spring ${accountType === 'individual' ? 'left-1' : 'left-[calc(50%+2px)]'
                }`}
            />
            <button
              type="button"
              onClick={() => setAccountType('individual')}
              className={`flex-1 relative z-10 flex items-center justify-center text-sm font-medium py-2 transition-colors duration-300 ${accountType === 'individual' ? 'text-arctic-700' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Individual
            </button>
            <button
              type="button"
              onClick={() => setAccountType('business')}
              className={`flex-1 relative z-10 flex items-center justify-center text-sm font-medium py-2 transition-colors duration-300 ${accountType === 'business' ? 'text-arctic-700' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <BuildingOfficeIcon className="w-4 h-4 mr-2" />
              Business
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name Field (Dynamic Label) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {accountType === 'individual' ? (
                  <>
                    <UserIcon className="w-4 h-4 inline mr-1" />
                    Full Name
                  </>
                ) : (
                  <>
                    <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                    Company Name
                  </>
                )}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-xl border ${errors.name ? 'border-red-300' : 'border-ice-200'} focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all text-sm`}
                placeholder={accountType === 'individual' ? "John Doe" : "Acme Inc."}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Business Number (Conditional) */}
            <AnimatePresence>
              {accountType === 'business' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <IdentificationIcon className="w-4 h-4 inline mr-1" />
                      Business Number (NZBN)
                    </label>
                    <input
                      type="text"
                      name="nzbn"
                      value={formData.nzbn}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-xl border ${errors.nzbn ? 'border-red-300' : 'border-ice-200'} focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all text-sm`}
                      placeholder="94290..."
                    />
                    {errors.nzbn && <p className="text-red-500 text-xs mt-1">{errors.nzbn}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-xl border ${errors.email ? 'border-red-300' : 'border-ice-200'} focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all text-sm`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <LockClosedIcon className="w-4 h-4 inline mr-1" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-xl border ${errors.password ? 'border-red-300' : 'border-ice-200'} focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all text-sm`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <LockClosedIcon className="w-4 h-4 inline mr-1" />
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-xl border ${errors.confirmPassword ? 'border-red-300' : 'border-ice-200'} focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all text-sm`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-arctic-500 via-arctic-600 to-arctic-500 bg-[length:200%_100%] animate-gradient text-white py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <span className="relative flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    Sign Up
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-3 text-center">
          <p className="text-sm text-ice-600">
            Already have an account?{' '}
            <Link to="/login" className="text-arctic-600 hover:text-arctic-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
