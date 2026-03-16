'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyDealsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/orders');
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8 text-gray-500">
      Redirecting to orders...
    </div>
  );
}
