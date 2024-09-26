'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@supabase/supabase-js';
import { Building, Moon, Sun, Users } from 'lucide-react';
import { useTheme } from "next-themes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { setTheme } = useTheme();

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

  const getActiveTab = () => {
    if (pathname.startsWith('/dashboard/merchants')) return 'merchants';
    return 'merchants'; // default to merchants if no match
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 bg-card shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <p className="mb-4 text-sm">Logged in as: {user?.email}</p>
          <Button onClick={handleSignOut} className="w-full mb-4">Sign Out</Button>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setTheme("light")}>
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setTheme("dark")}>
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </div>
        </div>
        <Tabs value={getActiveTab()} className="w-full" orientation="vertical">
          <TabsList className="flex flex-col items-stretch h-full">
            <TabsTrigger value="merchants" asChild className="justify-start">
              <Link href="/dashboard/merchants" className="flex items-center">
                <Users className="mr-2" />
                Merchants
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