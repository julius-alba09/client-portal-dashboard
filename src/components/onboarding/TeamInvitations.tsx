'use client';

import React, { useState } from 'react';
import { 
  UserGroupIcon, 
  PlusIcon, 
  XMarkIcon, 
  ChevronRightIcon,
  ChevronLeftIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { OnboardingData } from '@/app/onboarding/page';

interface TeamInvitationsProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function TeamInvitations({ data, onUpdate, onNext, onBack }: TeamInvitationsProps) {
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member'>('member');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTeamMember = () => {
    const newErrors: Record<string, string> = {};

    if (!newMemberEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMemberEmail)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (data.teamMembers.some(member => member.email === newMemberEmail)) {
      newErrors.email = 'This email is already added';
    } else if (newMemberEmail === data.email) {
      newErrors.email = 'You cannot invite yourself';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedMembers = [...data.teamMembers, {
      email: newMemberEmail,
      role: newMemberRole,
      name: newMemberName.trim() || undefined
    }];

    onUpdate({ teamMembers: updatedMembers });
    
    // Clear form
    setNewMemberEmail('');
    setNewMemberName('');
    setNewMemberRole('member');
    setErrors({});
  };

  const removeMember = (index: number) => {
    const updatedMembers = data.teamMembers.filter((_, i) => i !== index);
    onUpdate({ teamMembers: updatedMembers });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserGroupIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invite your team
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Invite team members to collaborate on client projects. You can skip this step and invite people later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Add Team Member Form */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add Team Member
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="memberEmail"
                      value={newMemberEmail}
                      onChange={(e) => {
                        setNewMemberEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      className={clsx(
                        'w-full pl-10 pr-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors',
                        errors.email 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      )}
                      placeholder="teammate@company.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="memberName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="memberName"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Jane Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Role
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setNewMemberRole('member')}
                    className={clsx(
                      'flex-1 p-3 text-center border rounded-xl transition-all',
                      newMemberRole === 'member'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                    )}
                  >
                    <div className="font-medium">Member</div>
                    <div className="text-sm opacity-75">Can view and edit assigned projects</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setNewMemberRole('admin')}
                    className={clsx(
                      'flex-1 p-3 text-center border rounded-xl transition-all',
                      newMemberRole === 'admin'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                    )}
                  >
                    <div className="font-medium">Admin</div>
                    <div className="text-sm opacity-75">Can manage all projects and settings</div>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={addTeamMember}
                className="flex items-center justify-center w-full px-4 py-3 border border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Team Member
              </button>
            </div>
          </div>

          {/* Team Members List */}
          {data.teamMembers.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Team Members ({data.teamMembers.length})
              </h3>
              
              <div className="space-y-3">
                {data.teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {member.name || member.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {member.name && member.email} · {member.role}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-2" />
              Back
            </button>

            <button
              type="submit"
              className="flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue to Database Setup
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
