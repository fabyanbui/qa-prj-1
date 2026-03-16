import {
  AccountStatus,
  NotificationType,
  OfferStatus,
  OrderStatus,
  RequestStatus,
} from '@prisma/client';

interface SeedAccount {
  id: string;
  email: string;
  plainPassword: string;
  status: AccountStatus;
  isAdmin?: boolean;
}

interface SeedProfile {
  id: string;
  accountId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
  location?: string;
}

interface SeedRequest {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  budgetMin: number;
  budgetMax: number;
  status: RequestStatus;
  deadline: Date;
}

interface SeedOffer {
  id: string;
  requestId: string;
  sellerId: string;
  price: number;
  message: string;
  estimatedDeliveryDays: number;
  status: OfferStatus;
}

interface SeedOrder {
  id: string;
  requestId: string;
  offerId: string;
  buyerId: string;
  sellerId: string;
  finalPrice: number;
  status: OrderStatus;
  completedAt?: Date;
}

interface SeedMessage {
  id: string;
  senderId: string;
  receiverId: string;
  requestId?: string;
  offerId?: string;
  content: string;
}

interface SeedReview {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}

interface SeedNotification {
  id: string;
  accountId: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedEntityId?: string;
  read?: boolean;
}

export const accounts: SeedAccount[] = [
  {
    id: 'a1',
    email: 'john@example.com',
    plainPassword: 'password123',
    status: 'ACTIVE',
  },
  {
    id: 'a2',
    email: 'jane@example.com',
    plainPassword: 'password456',
    status: 'ACTIVE',
  },
  {
    id: 'a3',
    email: 'bob@example.com',
    plainPassword: 'password789',
    status: 'ACTIVE',
  },
  {
    id: 'a4',
    email: 'admin@example.com',
    plainPassword: 'admin123',
    status: 'ACTIVE',
    isAdmin: true,
  },
];

export const profiles: SeedProfile[] = [
  {
    id: 'p1',
    accountId: 'a1',
    displayName: 'John Doe',
    bio: 'Buyer focused on quality and fast communication.',
    phoneNumber: '+84-900-100-100',
    location: 'Ho Chi Minh City',
  },
  {
    id: 'p2',
    accountId: 'a2',
    displayName: 'Jane Smith',
    bio: 'Full-time freelancer offering design and sourcing services.',
    phoneNumber: '+84-900-200-200',
    location: 'Da Nang',
  },
  {
    id: 'p3',
    accountId: 'a3',
    displayName: 'Bob Wilson',
    bio: 'Independent seller for electronics and custom furniture.',
    phoneNumber: '+84-900-300-300',
    location: 'Ho Chi Minh City',
  },
  {
    id: 'p4',
    accountId: 'a4',
    displayName: 'Marketplace Admin',
    bio: 'Platform moderation and support.',
    location: 'Remote',
  },
];

export const requestSeeds: SeedRequest[] = [
  {
    id: 'req-open-desk',
    buyerId: 'a1',
    title: 'Need a wooden desk for home office',
    description: 'Looking for a sturdy wooden desk around 120cm width.',
    category: 'Furniture',
    location: 'Ho Chi Minh City',
    budgetMin: 180,
    budgetMax: 230,
    status: 'OPEN',
    deadline: new Date('2026-03-25T12:00:00.000Z'),
  },
  {
    id: 'req-open-headphones',
    buyerId: 'a1',
    title: 'Wireless headphones for remote work',
    description: 'Need comfortable over-ear wireless headphones with good mic quality.',
    category: 'Electronics',
    location: 'Ho Chi Minh City',
    budgetMin: 140,
    budgetMax: 200,
    status: 'OPEN',
    deadline: new Date('2026-03-22T12:00:00.000Z'),
  },
  {
    id: 'req-closed-laptop',
    buyerId: 'a1',
    title: 'Ultrabook under $900',
    description: 'Need lightweight laptop, 16GB RAM minimum.',
    category: 'Electronics',
    location: 'Da Nang',
    budgetMin: 820,
    budgetMax: 900,
    status: 'CLOSED',
    deadline: new Date('2026-03-18T12:00:00.000Z'),
  },
  {
    id: 'req-closed-phone',
    buyerId: 'a1',
    title: 'Used iPhone 13 request',
    description: 'Looking for excellent battery health and no major scratches.',
    category: 'Electronics',
    location: 'Can Tho',
    budgetMin: 420,
    budgetMax: 520,
    status: 'CLOSED',
    deadline: new Date('2026-03-20T12:00:00.000Z'),
  },
  {
    id: 'req-closed-design',
    buyerId: 'a1',
    title: 'Landing page redesign',
    description: 'Need modern redesign for SaaS landing page.',
    category: 'Design',
    location: 'Remote',
    budgetMin: 250,
    budgetMax: 380,
    status: 'CLOSED',
    deadline: new Date('2026-03-21T12:00:00.000Z'),
  },
  {
    id: 'req-cancelled-logo',
    buyerId: 'a1',
    title: 'Need new logo concept',
    description: 'Project cancelled by buyer before selecting offer.',
    category: 'Design',
    location: 'Remote',
    budgetMin: 80,
    budgetMax: 130,
    status: 'CANCELLED',
    deadline: new Date('2026-03-27T12:00:00.000Z'),
  },
  {
    id: 'req-expired-camera',
    buyerId: 'a1',
    title: 'Mirrorless camera body only',
    description: 'No successful offer before deadline.',
    category: 'Electronics',
    location: 'Ha Noi',
    budgetMin: 550,
    budgetMax: 700,
    status: 'EXPIRED',
    deadline: new Date('2026-03-10T12:00:00.000Z'),
  },
  {
    id: 'req-closed-table',
    buyerId: 'a1',
    title: 'Dining table for 4 people',
    description: 'Solid wood preferred, delivery in one week.',
    category: 'Furniture',
    location: 'Ho Chi Minh City',
    budgetMin: 300,
    budgetMax: 450,
    status: 'CLOSED',
    deadline: new Date('2026-03-23T12:00:00.000Z'),
  },
];

export const offerSeeds: SeedOffer[] = [
  {
    id: 'offer-desk-jane',
    requestId: 'req-open-desk',
    sellerId: 'a2',
    price: 210,
    estimatedDeliveryDays: 2,
    message: 'Can deliver a premium oak desk with free assembly.',
    status: 'PENDING',
  },
  {
    id: 'offer-desk-bob',
    requestId: 'req-open-desk',
    sellerId: 'a3',
    price: 198,
    estimatedDeliveryDays: 4,
    message: 'Budget-friendly pine desk, reliable delivery service included.',
    status: 'PENDING',
  },
  {
    id: 'offer-headphones-bob',
    requestId: 'req-open-headphones',
    sellerId: 'a3',
    price: 175,
    estimatedDeliveryDays: 3,
    message: 'Noise-cancelling model with local warranty support.',
    status: 'PENDING',
  },
  {
    id: 'offer-laptop-jane',
    requestId: 'req-closed-laptop',
    sellerId: 'a2',
    price: 860,
    estimatedDeliveryDays: 2,
    message: 'Business ultrabook with next-day setup support.',
    status: 'ACCEPTED',
  },
  {
    id: 'offer-laptop-bob',
    requestId: 'req-closed-laptop',
    sellerId: 'a3',
    price: 880,
    estimatedDeliveryDays: 3,
    message: 'Alternative ultrabook model with longer shipping.',
    status: 'REJECTED',
  },
  {
    id: 'offer-phone-bob',
    requestId: 'req-closed-phone',
    sellerId: 'a3',
    price: 490,
    estimatedDeliveryDays: 1,
    message: 'Excellent condition, 92% battery health.',
    status: 'ACCEPTED',
  },
  {
    id: 'offer-design-jane',
    requestId: 'req-closed-design',
    sellerId: 'a2',
    price: 340,
    estimatedDeliveryDays: 5,
    message: 'Includes wireframes and final responsive assets.',
    status: 'ACCEPTED',
  },
  {
    id: 'offer-logo-bob',
    requestId: 'req-cancelled-logo',
    sellerId: 'a3',
    price: 95,
    estimatedDeliveryDays: 2,
    message: 'Can deliver 3 logo concepts and revisions.',
    status: 'WITHDRAWN',
  },
  {
    id: 'offer-table-jane',
    requestId: 'req-closed-table',
    sellerId: 'a2',
    price: 410,
    estimatedDeliveryDays: 6,
    message: 'Solid acacia table with included shipping.',
    status: 'ACCEPTED',
  },
];

export const orderSeeds: SeedOrder[] = [
  {
    id: 'order-laptop-jane',
    requestId: 'req-closed-laptop',
    offerId: 'offer-laptop-jane',
    buyerId: 'a1',
    sellerId: 'a2',
    finalPrice: 860,
    status: 'COMPLETED',
    completedAt: new Date('2026-03-14T08:00:00.000Z'),
  },
  {
    id: 'order-phone-bob',
    requestId: 'req-closed-phone',
    offerId: 'offer-phone-bob',
    buyerId: 'a1',
    sellerId: 'a3',
    finalPrice: 490,
    status: 'CANCELLED',
  },
  {
    id: 'order-design-jane',
    requestId: 'req-closed-design',
    offerId: 'offer-design-jane',
    buyerId: 'a1',
    sellerId: 'a2',
    finalPrice: 340,
    status: 'DISPUTED',
  },
  {
    id: 'order-table-jane',
    requestId: 'req-closed-table',
    offerId: 'offer-table-jane',
    buyerId: 'a1',
    sellerId: 'a2',
    finalPrice: 410,
    status: 'ACTIVE',
  },
];

export const messageSeeds: SeedMessage[] = [
  {
    id: 'msg-desk-1',
    senderId: 'a1',
    receiverId: 'a2',
    requestId: 'req-open-desk',
    content: 'Can you share desk material options?',
  },
  {
    id: 'msg-desk-2',
    senderId: 'a2',
    receiverId: 'a1',
    requestId: 'req-open-desk',
    content: 'Yes, I can provide oak and walnut variants.',
  },
  {
    id: 'msg-laptop-1',
    senderId: 'a1',
    receiverId: 'a2',
    requestId: 'req-closed-laptop',
    offerId: 'offer-laptop-jane',
    content: 'Thanks. Please include warranty docs on delivery.',
  },
];

export const reviewSeeds: SeedReview[] = [
  {
    id: 'review-laptop-buyer',
    orderId: 'order-laptop-jane',
    reviewerId: 'a1',
    revieweeId: 'a2',
    rating: 5,
    comment: 'Excellent communication and fast delivery.',
  },
  {
    id: 'review-laptop-seller',
    orderId: 'order-laptop-jane',
    reviewerId: 'a2',
    revieweeId: 'a1',
    rating: 5,
    comment: 'Clear requirements and quick confirmation.',
  },
];

export const notificationSeeds: SeedNotification[] = [
  {
    id: 'notif-new-offer-desk',
    accountId: 'a1',
    type: 'NEW_OFFER',
    title: 'New offer received',
    body: 'A seller has submitted a new offer for your desk request.',
    relatedEntityId: 'offer-desk-jane',
  },
  {
    id: 'notif-offer-accepted-jane',
    accountId: 'a2',
    type: 'OFFER_ACCEPTED',
    title: 'Offer accepted',
    body: 'Your laptop offer has been accepted and an order is active.',
    relatedEntityId: 'order-laptop-jane',
  },
  {
    id: 'notif-message-bob',
    accountId: 'a3',
    type: 'NEW_MESSAGE',
    title: 'New message',
    body: 'You have a new negotiation message.',
    read: true,
  },
];
