import { render, screen } from '@testing-library/react';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { CartProvider } from '@/lib/store/cart-context';
import { AuthProvider } from '@/lib/store/auth-context';
import { describe, it, expect } from 'vitest';

const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 100,
    image: '/test.jpg',
    description: 'Test Description',
    category: 'Test Category',
    rating: 5,
    stock: 10
};

describe('AddToCartButton', () => {
  it('does not render when no user is signed in', () => {
    render(
      <AuthProvider>
        <CartProvider>
          <AddToCartButton product={mockProduct} />
        </CartProvider>
      </AuthProvider>,
    );

    const button = screen.queryByRole('button', { name: /add to cart/i });
    expect(button).not.toBeInTheDocument();
  });
});
