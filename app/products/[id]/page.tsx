import Image from 'next/image';
import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import { AddToCartButton } from '@/components/product/AddToCartButton';

interface ProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateStaticParams() {
    return products.map((product) => ({
        id: product.id,
    }));
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const product = products.find((p) => p.id === id);

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
                {/* Image Gallery */}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover object-center"
                        priority
                    />
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        {product.name}
                    </h1>
                    <div className="mt-4">
                        <span className="sr-only">Price</span>
                        <p className="text-3xl tracking-tight text-gray-900">
                            ${product.price.toFixed(2)}
                        </p>
                    </div>

                    <div className="mt-6">
                        <h3 className="sr-only">Description</h3>
                        <p className="space-y-6 text-base text-gray-700">
                            {product.description}
                        </p>
                    </div>

                    <div className="mt-6 flex items-center">
                        <div className="flex items-center">
                            {[0, 1, 2, 3, 4].map((rating) => (
                                <svg
                                    key={rating}
                                    className={`h-5 w-5 flex-shrink-0 ${product.rating > rating ? 'text-yellow-400' : 'text-gray-200'
                                        }`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ))}
                        </div>
                        <p className="ml-3 text-sm text-gray-500">
                            {product.rating} out of 5 stars
                        </p>
                    </div>

                    <div className="mt-10 flex">
                        <AddToCartButton
                            product={product}
                            className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-full"
                        />
                    </div>

                    <div className="mt-8 border-t border-gray-200 pt-8">
                        <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
                        <div className="mt-4 prose prose-sm text-gray-500">
                            <ul role="list">
                                <li>stock: {product.stock}</li>
                                <li>Category: {product.category}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
