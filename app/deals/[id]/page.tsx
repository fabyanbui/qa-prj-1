'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LegacyDealDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    router.replace(`/orders/${id}`);
  }, [id, router]);

  return (
    <div className="container mx-auto px-4 py-8 text-gray-500">
      Redirecting to order details...
    </div>
  );
}
