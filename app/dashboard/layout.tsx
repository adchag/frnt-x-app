'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@supabase/supabase-js';
import { Building, Users, FileText } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.push('/auth/login');
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <p className="mb-4 text-sm">Logged in as: {user.email}</p>
          <Button onClick={handleSignOut} className="w-full mb-4">Sign Out</Button>
        </div>
        <Tabs defaultValue="assistants" className="w-full" orientation="vertical">
          <TabsList className="flex flex-col items-stretch h-full">
            <TabsTrigger value="assistants" asChild className="justify-start">
              <Link href="/dashboard" className="flex items-center">
                <Building className="mr-2" />
                Assistants
              </Link>
            </TabsTrigger>
            <TabsTrigger value="merchants" asChild className="justify-start">
              <Link href="/dashboard/merchants" className="flex items-center">
                <Users className="mr-2" />
                Merchants
              </Link>
            </TabsTrigger>
            <TabsTrigger value="convert-pdf" asChild className="justify-start">
              <Link href="/dashboard/convert-pdf" className="flex items-center">
                <FileText className="mr-2" />
                Convert PDF
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}