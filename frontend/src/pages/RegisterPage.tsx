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
      // Optional: enforce NZBN if business? For now, let's make it required as per "activates a business number box" implication
      // or maybe it's optional. Let's make it required for businesses to distinguish them.
      // Re-reading: "activates a business number box" implies existence. Let's act as if it's required for verified businesses.
      // But looking at previous code, Company Search was prominent, so NZBN likely expected.
      // However, to keep it simple as requested, let's just make it visible. Validation can be loose or strict.
      // Let's require it for 'business' to make the distinction meaningful.
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
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background Image - Matching Login Style */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${polarBearBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.85
        }}
      />
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-0" />

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
  );
};

export default RegisterPage;
