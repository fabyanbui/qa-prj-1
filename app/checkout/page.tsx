'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/lib/store/cart-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const checkoutSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Invalid email address' }),
    address: z.string().min(5, { message: 'Address is required' }),
    city: z.string().min(2, { message: 'City is required' }),
    zip: z.string().min(5, { message: 'Valid ZIP code required' }),
    card: z.string().min(16).max(16, { message: 'Card must be 16 digits' }),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CheckoutForm>({
        resolver: zodResolver(checkoutSchema),
    });

    const onSubmit = async (data: CheckoutForm) => {
        setIsSubmitting(true);
        try {
            // Call mock API
            await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, items }),
            });
            clearCart();
            alert('Order placed successfully!');
            router.push('/');
        } catch (error) {
            console.error(error);
            alert('Failed to place order');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">Your cart is empty</h1>
                <button onClick={() => router.push('/')} className="mt-4 text-indigo-600 hover:text-indigo-500">Continue Shopping</button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="mb-8 text-3xl font-bold text-gray-900">Checkout</h1>
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
                {/* Form */}
                <div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input {...register('name')} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input {...register('email')} type="email" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input {...register('address')} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input {...register('city')} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                                <input {...register('zip')} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                                {errors.zip && <p className="mt-1 text-sm text-red-600">{errors.zip.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Card Number</label>
                            <input {...register('card')} placeholder="Mock: 16 digits" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                            {errors.card && <p className="mt-1 text-sm text-red-600">{errors.card.message}</p>}
                        </div>

                        <button type="submit" disabled={isSubmitting} className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
                            {isSubmitting ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                    <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                    <div className="mt-6 flow-root">
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                            {items.map(item => (
                                <li key={item.id} className="flex py-6">
                                    <div className="flex flex-1 flex-col">
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                            <h3>{item.name}</h3>
                                            <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">Qty {item.quantity}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                            <p>Total</p>
                            <p>${total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
