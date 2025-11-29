'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/definitions';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), limit(8));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setFeaturedProducts(products);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full">
      <section className="relative bg-muted/40 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl font-headline">
            Welcome to E-Commers V
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Discover our curated collection of fine products. Quality and style delivered to your doorstep.
          </p>
          <div className="mt-10 flex justify-center gap-x-4">
            <Button asChild size="lg">
              <Link href="#featured-products">Shop Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="featured-products" className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-center font-headline">
            Featured Products
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-[280px] w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-8 w-1/2" />
                </div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
