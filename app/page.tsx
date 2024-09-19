import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900">
      <h1 className="text-6xl font-bold text-white mb-4">FRNT X</h1>
      <p className="text-2xl text-white mb-8">the everything app</p>
      <div className="space-y-4">
        <Link href="/login">
          <Button variant="secondary" size="lg" className="w-full">
            Sign In
          </Button>
        </Link>
    
      </div>
    </div>
  );
}
