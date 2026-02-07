export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    stock: number;
    sellerId: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export type Role = 'BUYER' | 'SELLER';

export interface User {
    id: string;
    name: string;
    email: string;
    roles: Role[];
}

export interface AuthSession {
    user: User;
    token: string;
}
