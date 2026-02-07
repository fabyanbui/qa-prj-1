import { render, screen } from '@testing-library/react'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { CartProvider } from '@/lib/store/cart-context'
import { describe, it, expect } from 'vitest'

const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 100,
    image: '/test.jpg',
    description: 'Test Description',
    category: 'Test Category',
    rating: 5,
    stock: 10
}

describe('AddToCartButton', () => {
    it('renders correctly', () => {
        render(
            <CartProvider>
                <AddToCartButton product={mockProduct} />
            </CartProvider>
        )
        const button = screen.getByRole('button', { name: /add to cart/i })
        expect(button).toBeInTheDocument()
    })
})
