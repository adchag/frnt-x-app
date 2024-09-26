'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AssistantsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/merchants');
  }, [router]);

  return null;
}