'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { AuthGuard, useAuth } from '@/contexts/AuthContext';
import { dummyClients } from '@/lib/dummy-data';

function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'client' && user.client_id) {
        // Redirect client to their dashboard
        router.push(`/clients/${user.client_id}`);
      } else if (user.role === 'admin') {
        // Redirect admin to first client's dashboard for demo
        router.push(`/clients/${dummyClients[0].id}`);
      }
    }
  }, [user, router]);

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Dashboard...
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Redirecting to {user?.role === 'admin' ? 'admin' : 'client'} portal
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}
