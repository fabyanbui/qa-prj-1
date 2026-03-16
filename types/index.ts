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

export type RequestStatus = 'OPEN' | 'CLOSED' | 'FULFILLED' | 'EXPIRED';
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type DealStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface MarketplaceRequest {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  deadline: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  buyer?: Pick<User, 'id' | 'name' | 'email'>;
  _count?: {
    offers: number;
  };
  deal?: {
    id: string;
    status: DealStatus;
    agreedPrice: number;
  } | null;
}

export interface MarketplaceOffer {
  id: string;
  requestId: string;
  sellerId: string;
  price: number;
  deliveryTime: string;
  message: string;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
  seller?: Pick<User, 'id' | 'name' | 'email'>;
  request?: {
    id: string;
    title: string;
    category: string;
    budget: number;
    location: string;
    deadline: string;
    status: RequestStatus;
    buyer: Pick<User, 'id' | 'name' | 'email'>;
  };
  deal?: {
    id: string;
    status: DealStatus;
    agreedPrice: number;
  } | null;
}

export interface MarketplaceDeal {
  id: string;
  requestId: string;
  offerId: string;
  buyerId: string;
  sellerId: string;
  agreedPrice: number;
  status: DealStatus;
  createdAt: string;
  updatedAt: string;
  buyer: Pick<User, 'id' | 'name' | 'email'>;
  seller: Pick<User, 'id' | 'name' | 'email'>;
  request: {
    id: string;
    title: string;
    category: string;
    location: string;
    deadline: string;
    status: RequestStatus;
  };
  offer: {
    id: string;
    deliveryTime: string;
    message: string;
  };
}
