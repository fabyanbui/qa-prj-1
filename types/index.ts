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

export type Role = 'BUYER' | 'SELLER' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';
export type RequestStatus = 'OPEN' | 'CLOSED' | 'EXPIRED' | 'CANCELLED';
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type OrderStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
export type NotificationType =
  | 'NEW_OFFER'
  | 'OFFER_ACCEPTED'
  | 'NEW_MESSAGE'
  | 'ORDER_COMPLETED';

export interface Profile {
  id: string;
  accountId: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  status: AccountStatus;
  isAdmin: boolean;
  roles: Role[];
  profile: Profile;
}

export interface UserPreview {
  id: string;
  email: string;
  roles?: Role[];
  profile: Pick<Profile, 'displayName' | 'avatarUrl' | 'location'>;
}

export interface Reputation {
  avgRating: number;
  totalReviews: number;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface MarketplaceRequest {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  category?: string | null;
  location?: string | null;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  buyer?: UserPreview;
  _count?: {
    offers: number;
  };
  order?: {
    id: string;
    status: OrderStatus;
    finalPrice: number;
  } | null;
}

export interface MarketplaceOffer {
  id: string;
  requestId: string;
  sellerId: string;
  price: number;
  message: string;
  estimatedDeliveryDays: number;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
  seller?: UserPreview;
  request?: {
    id: string;
    title: string;
    category?: string | null;
    location?: string | null;
    budgetMin: number;
    budgetMax: number;
    deadline: string;
    status: RequestStatus;
    buyer: UserPreview;
  };
  order?: {
    id: string;
    status: OrderStatus;
    finalPrice: number;
  } | null;
}

export interface MarketplaceOrder {
  id: string;
  requestId: string;
  offerId: string;
  buyerId: string;
  sellerId: string;
  finalPrice: number;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string | null;
  buyer: UserPreview;
  seller: UserPreview;
  request: {
    id: string;
    title: string;
    category?: string | null;
    location?: string | null;
    deadline: string;
    status: RequestStatus;
  };
  offer: {
    id: string;
    message: string;
    estimatedDeliveryDays: number;
  };
  reviews?: MarketplaceReview[];
}

export interface MarketplaceMessage {
  id: string;
  senderId: string;
  receiverId: string;
  requestId?: string | null;
  offerId?: string | null;
  content: string;
  createdAt: string;
  sender: UserPreview;
  receiver: UserPreview;
}

export interface MarketplaceReview {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  reviewer: UserPreview;
  reviewee: UserPreview;
}

export interface MarketplaceNotification {
  id: string;
  accountId: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedEntityId?: string | null;
  read: boolean;
  createdAt: string;
}
