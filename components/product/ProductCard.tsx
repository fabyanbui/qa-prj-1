import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { AddToCartButton } from './AddToCartButton';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <Link href={`/products/${product.id}`} className="block">
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover object-center transition-opacity group-hover:opacity-75"
                    />
                </div>
                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                {product.description}
            </p>
            <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                </span>
                <AddToCartButton product={product} />
            </div>
        </div>
    );
}
