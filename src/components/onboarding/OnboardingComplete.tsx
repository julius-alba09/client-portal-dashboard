'use client';

import React from 'react';
import { 
  CheckCircleIcon, 
  RocketLaunchIcon,
  ChevronLeftIcon,
  UserGroupIcon,
  CircleStackIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { OnboardingData } from '@/app/onboarding/page';

interface OnboardingCompleteProps {
  data: OnboardingData;
  onComplete: () => void;
  onBack: () => void;
}

export default function OnboardingComplete({ data, onComplete, onBack }: OnboardingCompleteProps) {
  const connectedDatabasesCount = Object.keys(data.databases).length;
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="w-10 h-10 text-white" />
        </div>

        {/* Header */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          🎉 You're all set up!
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Welcome to ClientPortal, {data.firstName}! Your workspace is ready and connected.
        </p>

        {/* Setup Summary */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Setup Summary
          </h3>
          
          <div className="space-y-4">
            {/* Account */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Account Created
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {data.firstName} {data.lastName} at {data.company}
                </div>
              </div>
            </div>

            {/* Team */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Team Setup
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {data.teamMembers.length === 0 
                    ? 'No team members added (you can invite them later)'
                    : `${data.teamMembers.length} team member${data.teamMembers.length > 1 ? 's' : ''} will be invited`
                  }
                </div>
              </div>
            </div>

            {/* Databases */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <CircleStackIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Database Connections
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {connectedDatabasesCount} Notion database{connectedDatabasesCount > 1 ? 's' : ''} connected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Databases */}
        {connectedDatabasesCount > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 mb-8 text-left">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-4">
              Connected Databases
            </h4>
            <div className="space-y-2">
              {Object.entries(data.databases).map(([type, db]) => (
                db && (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {type === 'clients' ? '👥' : type === 'projects' ? '📁' : '✅'}
                      </span>
                      <span className="font-medium text-indigo-900 dark:text-indigo-300 capitalize">
                        {type}:
                      </span>
                      <span className="text-indigo-700 dark:text-indigo-400">
                        {db.name}
                      </span>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8 text-left">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-4">
            What happens next?
          </h4>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-300">
            {data.teamMembers.length > 0 && (
              <div className="flex items-start space-x-2">
                <EnvelopeIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Team invitations will be sent to {data.teamMembers.length} member{data.teamMembers.length > 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex items-start space-x-2">
              <CircleStackIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Your Notion databases will start syncing automatically</span>
            </div>
            <div className="flex items-start space-x-2">
              <RocketLaunchIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>You'll be taken to your dashboard to start managing clients and projects</span>
            </div>
          </div>
        </div>

        {/* Team Members Preview */}
        {data.teamMembers.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8 text-left">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Team Members to Invite
            </h4>
            <div className="space-y-3">
              {data.teamMembers.map((member, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs">
                      {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {member.name || member.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {member.name && member.email} · {member.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6">
          <button
            onClick={onBack}
            className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back
          </button>

          <button
            onClick={onComplete}
            className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-lg"
          >
            <RocketLaunchIcon className="w-6 h-6 mr-3" />
            Launch Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
