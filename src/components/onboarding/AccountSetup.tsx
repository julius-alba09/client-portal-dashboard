'use client';

import React, { useState } from 'react';
import { UserIcon, BuildingOfficeIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { OnboardingData } from '@/app/onboarding/page';

interface AccountSetupProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const roleOptions = [
  { value: 'founder', label: 'Founder/CEO', description: 'I run the company' },
  { value: 'manager', label: 'Project Manager', description: 'I manage client projects' },
  { value: 'freelancer', label: 'Freelancer', description: 'I work with multiple clients' },
  { value: 'agency', label: 'Agency Owner', description: 'I run an agency or consultancy' },
  { value: 'other', label: 'Other', description: 'Something else' },
];

export default function AccountSetup({ data, onUpdate, onNext }: AccountSetupProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    onUpdate({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!data.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!data.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!data.role) {
      newErrors.role = 'Please select your role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Let's get to know you
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tell us a bit about yourself and your company so we can personalize your experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={data.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={clsx(
                  'w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors',
                  errors.firstName 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                )}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={data.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={clsx(
                  'w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors',
                  errors.lastName 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                )}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={clsx(
                'w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors',
                errors.email 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              )}
              placeholder="john@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="company"
                value={data.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className={clsx(
                  'w-full pl-10 pr-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors',
                  errors.company 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                )}
                placeholder="Acme Inc."
              />
            </div>
            {errors.company && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.company}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What's your role? *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('role', option.value)}
                  className={clsx(
                    'p-4 text-left border rounded-xl transition-all hover:border-indigo-300 dark:hover:border-indigo-600',
                    data.role === option.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  )}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
            {errors.role && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
            )}
          </div>

          {/* Continue Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue to Team Setup
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
