'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/supabase.client';

const Home = () => {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
      <h1 className="text-6xl font-bold text-white mb-4">FRNT X</h1>
      <p className="text-2xl text-white mb-8">The everything app</p>
      <div className="space-y-4">
        <Link href="/auth/login">
          <Button variant="secondary" size="lg" className="w-full">
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
