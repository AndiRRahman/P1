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
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'products', params.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Ensure media is an array, provide fallback if it's missing
        const productData = { id: docSnap.id, ...data, media: data.media || [] } as Product;
        setProduct(productData);
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
        <div>
          {product.media && product.media.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {product.media.map((m, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square relative rounded-lg overflow-hidden border">
                      {m.type === 'image' ? (
                        <Image
                          src={m.url}
                          alt={`${product.name} - media ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <video
                          src={m.url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          ) : (
             <div className="rounded-lg overflow-hidden border aspect-square flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">No media available</p>
             </div>
          )}
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
            <p className={`text-sm font-medium ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
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
                    max={product.stockQuantity}
                />
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <Button size="lg" onClick={handleAddToCart} disabled={product.stockQuantity === 0}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
