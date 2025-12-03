import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CompanySearch from '@/components/CompanySearch';
import { WalletConnect } from '@/components/WalletConnect';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface SelectedCompany {
  name: string;
  number: string;
}

const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const [step, setStep] = useState<'search' | 'details'>('search');
  const [selectedCompany, setSelectedCompany] = useState<SelectedCompany | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleCompanySelect = (company: { name: string; number: string }) => {
    setSelectedCompany(company);
    setStep('details');
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

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

    if (!validateForm() || !selectedCompany) return;

    try {
      await register({
        companyName: selectedCompany.name,
        nzbn: selectedCompany.number,
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

  const handleBack = () => {
    setStep('search');
    setSelectedCompany(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 via-white to-arctic-50">
      <AnimatePresence mode="wait">
        {step === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col"
          >
            {/* Large Hero Section for Company Search */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
              {/* Polar Bear Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-5xl sm:text-6xl">🐻‍❄️</span>
                </div>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-10 max-w-2xl"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 font-display mb-4">
                  Find Your Company
                </h1>
                <p className="text-xl sm:text-2xl text-ice-600">
                  Search the NZ Companies Register to get started
                </p>
              </motion.div>

              {/* Large Search Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-3xl px-4"
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-ice-100 p-6 sm:p-10">
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 bg-arctic-100 rounded-full flex items-center justify-center mr-4">
                      <MagnifyingGlassIcon className="w-7 h-7 text-arctic-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Company Search</h2>
                      <p className="text-ice-500">Enter your company name or NZBN number</p>
                    </div>
                  </div>

                  <CompanySearch
                    onSelect={handleCompanySelect}
                    placeholder="e.g. Acme Ltd or 9429012345678"
                    className="mb-6"
                  />

                  <div className="flex items-center justify-center text-sm text-ice-400">
                    <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                    <span>We verify your company with the official NZ Companies Register</span>
                  </div>
                </div>
              </motion.div>

              {/* Sign in link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-10 text-center"
              >
                <p className="text-ice-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-arctic-600 hover:text-arctic-700 font-semibold">
                    Sign in
                  </Link>
                </p>
                <p className="text-ice-400 text-sm mt-2">
                  Can't find your company?{' '}
                  <a href="mailto:icemira@pm.me" className="text-ice-500 hover:text-arctic-600 underline">
                    Contact us
                  </a>
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === 'details' && selectedCompany && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center py-6 px-4"
          >
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full mb-3 shadow-lg">
                  <span className="text-2xl">🐻‍❄️</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 font-display">Almost There!</h1>
                <p className="text-sm text-ice-600 mt-1">Just add your email and password</p>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-arctic-500 text-white">
                    <CheckCircleIcon className="w-6 h-6" />
                  </div>
                  <div className="w-16 h-1 mx-2 rounded bg-arctic-500" />
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-arctic-500 text-white shadow-lg">
                    2
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-ice-100 overflow-hidden p-5">
                {/* Wallet Connection */}
                <div className="mb-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <h3 className="text-xs font-semibold text-orange-800 mb-1 text-center">Crypto-Friendly? Connect Wallet</h3>
                  <p className="text-xs text-orange-600 text-center mb-2">Connect your Core Wallet to enable instant crypto payments.</p>
                  <WalletConnect />
                </div>

                {/* Selected Company Card */}
                <div className="bg-gradient-to-r from-arctic-50 to-ice-50 rounded-xl p-3 mb-4 border border-arctic-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-arctic-500 rounded-full flex items-center justify-center mr-3">
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{selectedCompany.name}</p>
                        <p className="text-sm text-ice-500">NZBN: {selectedCompany.number}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleBack}
                      className="text-arctic-600 hover:text-arctic-700 text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <EnvelopeIcon className="w-3 h-3 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm rounded-xl border ${errors.email ? 'border-red-300 bg-red-50' : 'border-ice-200'
                        } focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all`}
                      placeholder="you@company.co.nz"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <LockClosedIcon className="w-3 h-3 inline mr-1" />
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm rounded-xl border ${errors.password ? 'border-red-300 bg-red-50' : 'border-ice-200'
                        } focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all`}
                      placeholder="Min 8 characters"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <LockClosedIcon className="w-3 h-3 inline mr-1" />
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm rounded-xl border ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-ice-200'
                        } focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all`}
                      placeholder="Re-enter password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-arctic-500 via-arctic-600 to-arctic-500 bg-[length:200%_100%] animate-gradient text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    <span className="relative flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🐻‍❄️</span>
                          Create Account
                          <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </div>

              {/* Footer */}
              <div className="mt-3 text-center">
                <p className="text-xs text-ice-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-arctic-600 hover:text-arctic-700 font-semibold">
                    Sign in
                  </Link>
                </p>
                <p className="text-ice-400 text-xs mt-1">
                  Can't find your company?{' '}
                  <a href="mailto:icemira@pm.me" className="text-ice-500 hover:text-arctic-600 underline">
                    Contact us
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterPage;
