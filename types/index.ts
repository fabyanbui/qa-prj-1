export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    stock: number;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthSession {
    user: User;
    token: string;
}
