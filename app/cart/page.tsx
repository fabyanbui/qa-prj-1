'use client';

import { useCart } from '@/lib/store/cart-context';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
    const { items, removeItem, updateQuantity, total } = useCart();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
                <Link href="/" className="text-indigo-600 hover:text-indigo-500">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
            <div className="flow-root">
                <ul role="list" className="-my-6 divide-y divide-gray-200">
                    {items.map((item) => (
                        <li key={item.id} className="flex py-6">
                            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover object-center"
                                />
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>
                                            <Link href={`/products/${item.id}`}>{item.name}</Link>
                                        </h3>
                                        <p className="ml-4">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-100"
                                        >
                                            -
                                        </button>
                                        <span className="font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
                <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>${total.toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                    Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-6">
                    <Link
                        href="/checkout"
                        className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                        Proceed to Checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}
