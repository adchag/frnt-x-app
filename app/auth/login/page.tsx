'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      toast({
        title: "Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@frnt.io',
        password: '@gExNSDk?Q7PH$!r'
      });
      
      if (error) throw error;
      
      console.log('Sign in successful:', data);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error signing in with test account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with test account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={handleTestSignIn}>
              Sign In with Test Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}