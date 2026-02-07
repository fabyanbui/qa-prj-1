'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/store/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SellerDashboard() {
    const { activeSession } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!activeSession) {
            router.push('/login');
            return;
        }

        if (!activeSession.user.roles.includes('SELLER')) {
            router.push('/');
            return;
        }

        fetchProducts();
    }, [activeSession]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            // Filter products owned by the current seller
            const sellerProducts = data.filter((p: any) => p.sellerId === activeSession?.user.id);
            setProducts(sellerProducts);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setProducts(products.filter((p) => p.id !== id));
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete product');
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
                    <p className="mt-1 text-gray-500">Manage your products and sales</p>
                </div>
                <Link
                    href="/seller/products/new"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                    Add New Product
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white text-sm">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    No products found. Start by adding your first product!
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-medium text-gray-900">{product.name}</div>
                                                <div className="text-gray-500 line-clamp-1 max-w-xs">{product.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{product.category}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-gray-500">{product.stock}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                                        <Link href={`/seller/products/edit/${product.id}`} className="mr-4 text-indigo-600 hover:text-indigo-900">Edit</Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
