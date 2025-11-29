'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import type { Order, User } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [appUser, setAppUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  useEffect(() => {
    if(user && firestore) {
        const q = query(collection(firestore, 'users', user.uid, 'orders'), orderBy('orderDate', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(userOrders);
            setOrdersLoading(false);
        });
        return () => unsubscribe();
    }
  }, [user, firestore]);

  if (isUserLoading || !user) {
    return <div className="container mx-auto py-12"><Skeleton className="h-96 w-full" /></div>;
  }
  
  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
        case 'Pending': return 'secondary';
        case 'Shipped': return 'default';
        case 'Delivered': return 'outline'; // Success-like
        case 'Cancelled': return 'destructive';
        default: return 'secondary';
    }
  }

  const formatDate = (timestamp: any) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString();
    }
    if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString();
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString();
    }
    return 'Invalid Date';
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={user.displayName || 'User'} />
                <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{user.displayName}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
          </Card>
        </div>
        <div className="md:col-span-2">
            <h2 className="text-3xl font-bold font-headline mb-6">Order History</h2>
            <Card>
                <CardContent className="p-0">
                    {ordersLoading ? (
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : orders.length > 0 ? (
                        <ul className="divide-y">
                            {orders.map(order => (
                                <li key={order.id} className="p-4 md:p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-lg">Order #{(order.id || '').slice(0, 7)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(order.orderDate)}
                                            </p>
                                        </div>
                                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                    </div>
                                    <Separator className="my-4" />
                                    <ul className="space-y-2">
                                        {(order.items || []).map(item => (
                                            <li key={item.id} className="flex justify-between items-center text-sm">
                                                <p>{item.name} <span className="text-muted-foreground">x {item.quantity}</span></p>
                                                <p>${(item.price * item.quantity).toFixed(2)}</p>
                                            </li>
                                        ))}
                                    </ul>
                                    <Separator className="my-4" />
                                     <div className="flex justify-end font-bold">
                                        <p>Total: ${order.totalAmount.toFixed(2)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-10 text-center">
                            <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
