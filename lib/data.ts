import { Product } from '@/types';

export const products: Product[] = [
    {
        id: '1',
        name: 'Premium Wireless Headphones',
        description: 'Experience high-fidelity sound with our premium wireless headphones.',
        price: 299.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        category: 'Electronics',
        rating: 4.8,
        stock: 50,
        sellerId: 'u2',
    },
    {
        id: '2',
        name: 'Minimalist Wrist Watch',
        description: 'A classic design for the modern professional.',
        price: 129.50,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        category: 'Accessories',
        rating: 4.5,
        stock: 20,
        sellerId: 'u2',
    },
    {
        id: '3',
        name: 'Ergonomic Office Chair',
        description: 'Maximum comfort for long hours of work.',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80',
        category: 'Furniture',
        rating: 4.2,
        stock: 15,
        sellerId: 'u3',
    },
    {
        id: '4',
        name: 'Smartphone Gimbal',
        description: 'Capture smooth cinematic footage with your phone.',
        price: 89.00,
        image: 'https://images.unsplash.com/photo-1552058544-300407f154cc?w=500&q=80',
        category: 'Photography',
        rating: 4.6,
        stock: 30,
        sellerId: 'u3',
    },
    {
        id: '5',
        name: 'Professional Camera Lens',
        description: 'Sharp images and beautiful bokeh for professional photography.',
        price: 450.00,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80',
        category: 'Photography',
        rating: 4.9,
        stock: 5,
        sellerId: 'u2',
    },
    {
        id: '6',
        name: 'Mechanical Keyboard',
        description: 'Tactile typing experience with RGB backlighting.',
        price: 150.00,
        image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80',
        category: 'Electronics',
        rating: 4.7,
        stock: 25,
        sellerId: 'u3',
    },
];

export const users = [
    {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        roles: ['BUYER']
    },
    {
        id: 'u2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password456',
        roles: ['BUYER', 'SELLER']
    },
    {
        id: 'u3',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: 'password789',
        roles: ['SELLER']
    }
];
