'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/types';
import { getClientById, dummyClients } from '@/lib/dummy-data';

interface AuthContextType {
  user: AuthUser | null;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - in a real app, this would come from your auth provider
const mockUsers: (AuthUser & { password: string })[] = [
  {
    id: '1',
    email: 'john@techcorp.com',
    name: 'John Smith',
    role: 'client',
    client_id: '1',
    password: 'password123', // In real app, this would be hashed
  },
  {
    id: '2',
    email: 'sarah@designstudio.com',
    name: 'Sarah Johnson',
    role: 'client',
    client_id: '2',
    password: 'password123',
  },
  {
    id: '3',
    email: 'michael@startupventures.io',
    name: 'Michael Chen',
    role: 'client',
    client_id: '3',
    password: 'password123',
  },
  {
    id: 'admin',
    email: 'admin@clientportal.com',
    name: 'Admin User',
    role: 'admin',
    password: 'admin123',
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const isLoading = status === 'loading';
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      // Map NextAuth session to our AuthUser type
      const mappedUser: AuthUser = {
        id: session.user.id || session.user.email || 'unknown',
        email: session.user.email!,
        name: session.user.name || session.user.email!.split('@')[0],
        role: 'client', // Default role, could be enhanced based on domain or database lookup
        client_id: getMockClientIdForEmail(session.user.email!)
      };

      // Check if it's an admin user
      if (session.user.email === 'admin@clientportal.com') {
        mappedUser.role = 'admin';
        delete mappedUser.client_id;
      }

      setUser(mappedUser);
    } else {
      setUser(null);
    }
  }, [session]);

  const logout = async () => {
    await signOut({ redirect: false });
    setUser(null);
    router.push('/auth/signin');
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper function to map email to mock client ID
function getMockClientIdForEmail(email: string): string {
  const emailToClientMap: Record<string, string> = {
    'john@techcorp.com': '1',
    'sarah@designstudio.com': '2',
    'michael@startupventures.io': '3'
  };
  return emailToClientMap[email] || '1'; // Default to client 1
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth guard component
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

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

  return <>{children}</>;
}

