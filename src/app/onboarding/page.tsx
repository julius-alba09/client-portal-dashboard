'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CheckIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import AccountSetup from '@/components/onboarding/AccountSetup';
import TeamInvitations from '@/components/onboarding/TeamInvitations';
import DatabaseConnection from '@/components/onboarding/DatabaseConnection';
import OnboardingComplete from '@/components/onboarding/OnboardingComplete';

export type OnboardingStep = 'account' | 'team' | 'databases' | 'complete';

export interface OnboardingData {
  // Account info
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  
  // Team invitations
  teamMembers: Array<{
    email: string;
    role: 'admin' | 'member';
    name?: string;
  }>;
  
  // Database connections
  databases: {
    clients?: {
      id: string;
      name: string;
      url: string;
    };
    projects?: {
      id: string;
      name: string;
      url: string;
    };
    tasks?: {
      id: string;
      name: string;
      url: string;
    };
  };
}

const steps = [
  {
    id: 'account',
    name: 'Account Setup',
    description: 'Tell us about yourself'
  },
  {
    id: 'team',
    name: 'Invite Team',
    description: 'Add team members (optional)'
  },
  {
    id: 'databases',
    name: 'Connect Databases',
    description: 'Link your Notion databases'
  },
  {
    id: 'complete',
    name: 'Complete',
    description: 'You\'re all set!'
  }
];

export default function OnboardingPage() {
  const { user, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('account');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: '',
    teamMembers: [],
    databases: {}
  });

  const router = useRouter();

  // Pre-populate user data from auth context
  useEffect(() => {
    if (user) {
      setOnboardingData(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
      }));
    }
  }, [user]);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading...
          </h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const nextStep = () => {
    const stepOrder: OnboardingStep[] = ['account', 'team', 'databases', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const stepOrder: OnboardingStep[] = ['account', 'team', 'databases', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const skipToStep = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  const completeOnboarding = () => {
    // Here you would typically:
    // 1. Save user account data to your backend
    // 2. Send team invitations
    // 3. Store database connections
    // 4. Set up user session
    
    console.log('Completing onboarding with data:', onboardingData);
    
    // For demo purposes, redirect to dashboard
    router.push('/');
  };

  const isStepCompleted = (stepId: string) => {
    switch (stepId) {
      case 'account':
        return onboardingData.firstName && onboardingData.lastName && onboardingData.email && onboardingData.company;
      case 'team':
        return true; // Team step is optional
      case 'databases':
        return onboardingData.databases.clients && onboardingData.databases.projects && onboardingData.databases.tasks;
      default:
        return false;
    }
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'account':
        return (
          <AccountSetup
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={nextStep}
          />
        );
      case 'team':
        return (
          <TeamInvitations
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={nextStep}
            onBack={previousStep}
          />
        );
      case 'databases':
        return (
          <DatabaseConnection
            data={onboardingData}
            onUpdate={updateOnboardingData}
            onNext={nextStep}
            onBack={previousStep}
          />
        );
      case 'complete':
        return (
          <OnboardingComplete
            data={onboardingData}
            onComplete={completeOnboarding}
            onBack={previousStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">CP</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome to ClientPortal
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Let's get your workspace set up in just a few minutes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className={clsx(
                  stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
                  'relative'
                )}>
                  <div className="flex items-center">
                    <button
                      onClick={() => skipToStep(step.id as OnboardingStep)}
                      className={clsx(
                        'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                        step.id === currentStep
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : isStepCompleted(step.id)
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400'
                      )}
                    >
                      {isStepCompleted(step.id) ? (
                        <CheckIcon className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{stepIdx + 1}</span>
                      )}
                    </button>
                    <div className="ml-4 min-w-0 flex-1">
                      <div className={clsx(
                        'text-sm font-medium transition-colors',
                        step.id === currentStep
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : isStepCompleted(step.id)
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                      )}>
                        {step.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-5 left-5 w-full h-0.5 bg-gray-200 dark:bg-gray-700">
                      <div 
                        className={clsx(
                          'h-full transition-all duration-500',
                          getCurrentStepIndex() > stepIdx ? 'bg-green-500' : 'bg-transparent'
                        )}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderStepContent()}
      </div>
    </div>
  );
}
