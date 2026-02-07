'use client';

import { useCart } from '@/lib/store/cart-context';
import { useAuth } from '@/lib/store/auth-context';
import { Product } from '@/types';

interface AddToCartButtonProps {
    product: Product;
    className?: string;
}

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
    const { addItem } = useCart();
    const { activeSession } = useAuth();

    if (!activeSession) {
        return null;
    }

    return (
        <button
            onClick={(e) => {
                e.preventDefault(); // Prevent link navigation if used inside a Link
                addItem(product);
            }}
            className={
                className ||
                'rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
            }
        >
            Add to Cart
        </button>
    );
}
