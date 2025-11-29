'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import type { Product } from '@/lib/definitions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useCart } from '@/context/cart-context';
import { ShoppingCart, ImageIcon } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { user } = useUser();
  const { addToCart } = useCart();

  const handleCardClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      router.push(`/products/${product.id}`);
    }
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      router.push('/login');
    } else {
      addToCart(product, 1);
    }
  };

  const firstImage = product.media?.find(m => m.type === 'image');

  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer flex flex-col" onClick={handleCardClick}>
      <CardHeader className="p-0 border-b">
        <div className="aspect-w-4 aspect-h-3 bg-muted">
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={product.name}
              width={600}
              height={400}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline tracking-tight">{product.name}</CardTitle>
        <p className="mt-2 text-muted-foreground text-sm">{product.category}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-xl font-bold text-primary">
          ${product.price.toFixed(2)}
        </p>
        <Button size="icon" variant="outline" onClick={handleAddToCart} aria-label="Add to cart" disabled={product.stockQuantity === 0}>
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
