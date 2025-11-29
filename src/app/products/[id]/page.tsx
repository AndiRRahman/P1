'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'products', params.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      } else {
        notFound();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
              <Skeleton className="h-[450px] w-full rounded-lg" />
              <div className="space-y-6">
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-24 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-48" />
                  </div>
              </div>
          </div>
      </div>
    )
  }

  if (!product) {
    return notFound();
  }

  const handleAddToCart = () => {
    if (quantity > 0) {
      addToCart(product, quantity);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="rounded-lg overflow-hidden border">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={800}
            height={600}
            className="w-full h-full object-cover"
            data-ai-hint={product.imageHint}
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold font-headline">{product.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{product.category}</p>
          <p className="mt-4 text-3xl font-bold text-primary">${product.price.toFixed(2)}</p>
          
          <Separator className="my-6" />

          <p className="text-base text-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="mt-8">
            <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </div>

          <div className="mt-8 flex items-center gap-4">
             <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                    <Minus className="h-4 w-4" />
                </Button>
                <Input 
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-16 text-center"
                    min="1"
                    max={product.stock}
                />
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <Button size="lg" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
