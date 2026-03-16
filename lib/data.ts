import { DealStatus, OfferStatus, RequestStatus, Role } from '@prisma/client';

interface SeedUser {
  id: string;
  name: string;
  email: string;
  password: string;
  roles: Role[];
}

interface SeedRequest {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  deadline: Date;
  status: RequestStatus;
}

interface SeedOffer {
  id: string;
  requestId: string;
  sellerId: string;
  price: number;
  deliveryTime: string;
  message: string;
  status: OfferStatus;
}

interface SeedDeal {
  id: string;
  requestId: string;
  offerId: string;
  buyerId: string;
  sellerId: string;
  agreedPrice: number;
  status: DealStatus;
}

export const users: SeedUser[] = [
  {
    id: 'u1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    roles: ['BUYER'],
  },
  {
    id: 'u2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password456',
    roles: ['BUYER', 'SELLER'],
  },
  {
    id: 'u3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    password: 'password789',
    roles: ['SELLER'],
  },
];

export const requestSeeds: SeedRequest[] = [
  {
    id: 'req-open-desk',
    buyerId: 'u1',
    title: 'Need a wooden desk for home office',
    description:
      'Looking for a sturdy wooden desk around 120cm width. Prefer minimalist design with delivery this week.',
    category: 'Furniture',
    budget: 220,
    location: 'Ho Chi Minh City',
    deadline: new Date('2026-03-25T12:00:00.000Z'),
    status: 'OPEN',
  },
  {
    id: 'req-open-headphones',
    buyerId: 'u1',
    title: 'Wireless headphones for remote work',
    description:
      'Need comfortable over-ear wireless headphones with good microphone quality for daily meetings.',
    category: 'Electronics',
    budget: 180,
    location: 'Ho Chi Minh City',
    deadline: new Date('2026-03-22T12:00:00.000Z'),
    status: 'OPEN',
  },
  {
    id: 'req-fulfilled-laptop',
    buyerId: 'u1',
    title: 'Ultrabook under $900',
    description:
      'Need a lightweight laptop for office productivity and travel. At least 16GB RAM and SSD required.',
    category: 'Electronics',
    budget: 900,
    location: 'Da Nang',
    deadline: new Date('2026-03-18T12:00:00.000Z'),
    status: 'FULFILLED',
  },
];

export const offerSeeds: SeedOffer[] = [
  {
    id: 'offer-desk-jane',
    requestId: 'req-open-desk',
    sellerId: 'u2',
    price: 210,
    deliveryTime: '2 days',
    message: 'Can deliver a premium oak desk with free assembly.',
    status: 'PENDING',
  },
  {
    id: 'offer-desk-bob',
    requestId: 'req-open-desk',
    sellerId: 'u3',
    price: 198,
    deliveryTime: '4 days',
    message: 'Budget-friendly pine desk, reliable delivery service included.',
    status: 'PENDING',
  },
  {
    id: 'offer-headphones-bob',
    requestId: 'req-open-headphones',
    sellerId: 'u3',
    price: 175,
    deliveryTime: '3 days',
    message: 'Noise-cancelling model with warranty support.',
    status: 'PENDING',
  },
  {
    id: 'offer-laptop-jane',
    requestId: 'req-fulfilled-laptop',
    sellerId: 'u2',
    price: 860,
    deliveryTime: '2 days',
    message: 'Business ultrabook with 16GB RAM and next-day setup support.',
    status: 'ACCEPTED',
  },
  {
    id: 'offer-laptop-bob',
    requestId: 'req-fulfilled-laptop',
    sellerId: 'u3',
    price: 880,
    deliveryTime: '3 days',
    message: 'Alternative ultrabook model, slightly longer shipping.',
    status: 'REJECTED',
  },
];

export const dealSeeds: SeedDeal[] = [
  {
    id: 'deal-laptop-jane',
    requestId: 'req-fulfilled-laptop',
    offerId: 'offer-laptop-jane',
    buyerId: 'u1',
    sellerId: 'u2',
    agreedPrice: 860,
    status: 'ACTIVE',
  },
];
