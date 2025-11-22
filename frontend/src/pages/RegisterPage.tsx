import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    nzbn: '',
  });
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const handleCompanyLookup = async () => {
    if (!formData.nzbn || formData.nzbn.length < 10) return;

    setIsLookingUp(true);
    setLookupError('');

    try {
      const response = await fetch(`http://localhost:5000/api/companies/${formData.nzbn}/auto-populate`);
      const data = await response.json();

      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          companyName: data.data.legalName || prev.companyName
        }));
      } else {
        setLookupError('Company not found');
      }
    } catch (error) {
      setLookupError('Failed to lookup company');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
    } catch (error) {
      // Error is handled in AuthContext with toast
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-ice-50 flex items-center justify-center">
      <div className="card p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">NZBN / Company Number</label>
            <div className="flex gap-2">
              <input
                name="nzbn"
                value={formData.nzbn}
                onChange={handleChange}
                onBlur={handleCompanyLookup}
                className="input-field"
                placeholder="94290..."
              />
              <button
                type="button"
                onClick={handleCompanyLookup}
                disabled={isLookingUp}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
              >
                {isLookingUp ? '...' : 'Search'}
              </button>
            </div>
            {lookupError && <p className="text-xs text-red-500 mt-1">{lookupError}</p>}
          </div>

          <div>
            <label className="label">Company Name</label>
            <input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="input-field bg-gray-50"
              placeholder="Your Company Ltd."
              required
              readOnly
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="admin@company.com"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-ice-600">
            Already have an account?{' '}
            <Link to="/login" className="text-arctic-600 hover:text-arctic-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;