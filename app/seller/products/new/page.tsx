'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';
import { useEffect, useState } from 'react';

const productSchema = z.object({
    name: z.string().min(3, 'Name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Valid price required'),
    category: z.string().min(1, 'Category is required'),
    image: z.string().url('Valid image URL required'),
    stock: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, 'Valid stock required'),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductFormPage() {
    const { activeSession } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const isEdit = !!id;
    const [isLoading, setIsLoading] = useState(isEdit);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        }
    });

    useEffect(() => {
        if (!activeSession) {
            router.push('/login');
            return;
        }

        if (isEdit) {
            fetch(`/api/products/${id}`)
                .then(res => res.json())
                .then(data => {
                    setValue('name', data.name);
                    setValue('description', data.description);
                    setValue('price', data.price.toString());
                    setValue('category', data.category);
                    setValue('image', data.image);
                    setValue('stock', data.stock.toString());
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setIsLoading(false);
                });
        }
    }, [id, isEdit, activeSession, setValue, router]);

    const onSubmit = async (data: ProductFormData) => {
        if (!activeSession) return;

        try {
            const url = isEdit ? `/api/products/${id}` : '/api/products';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    sellerId: activeSession.user.id,
                }),
            });

            if (response.ok) {
                router.push('/seller');
            } else {
                alert('Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-8 text-3xl font-bold text-gray-900">
                {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input {...register('name')} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. Wireless Headphones" />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea {...register('description')} rows={4} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Describe your product in detail..." />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                        <input {...register('price')} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="0.00" />
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                        <input {...register('stock')} type="number" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="0" />
                        {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select {...register('category')} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="">Select a category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Photography">Photography</option>
                        <option value="Clothing">Clothing</option>
                    </select>
                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input {...register('image')} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="https://images.unsplash.com/..." />
                    {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
