'use client';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import type { Order, User } from '@/lib/definitions';
import { useState, useEffect } from 'react';
import { collectionGroup, onSnapshot, orderBy, query, getDoc, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminOrdersPage() {
    const firestore = useFirestore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore) return;

        // Kueri Collection Group tanpa orderBy untuk menghindari error indeks
        const ordersQuery = query(collectionGroup(firestore, "orders"));
        
        const unsubscribe = onSnapshot(ordersQuery, async (querySnapshot) => {
            const userCache = new Map<string, User>();
            const fetchedOrders: Order[] = [];

            for (const orderDoc of querySnapshot.docs) {
                const orderData = orderDoc.data() as Omit<Order, 'id'>;
                let userData: User | undefined = userCache.get(orderData.userId);

                if (!userData) {
                    try {
                        const userDocRef = doc(firestore, 'users', orderData.userId);
                        const userDocSnap = await getDoc(userDocRef);
                        if (userDocSnap.exists()) {
                            userData = userDocSnap.data() as User;
                            userCache.set(orderData.userId, userData);
                        }
                    } catch (error) {
                        console.error(`Failed to fetch user ${orderData.userId}`, error);
                    }
                }
                
                fetchedOrders.push({ 
                    id: orderDoc.id, 
                    ...orderData,
                    // Fallback ke objek user default jika pengambilan gagal
                    User: userData || { id: orderData.userId, name: 'Unknown User', email: '', role: 'customer', address: '', phone: '' }
                });
            }

            // Urutkan pesanan di sisi klien
            const sortedOrders = fetchedOrders.sort((a, b) => {
                const dateA = (a.orderDate as any)?.toDate ? (a.orderDate as any).toDate() : new Date(a.orderDate);
                const dateB = (b.orderDate as any)?.toDate ? (b.orderDate as any).toDate() : new Date(b.orderDate);
                return dateB.getTime() - dateA.getTime();
            });

            setOrders(sortedOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore]);

    if (loading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-headline">Orders</h1>
            <DataTable columns={columns} data={orders} />
        </div>
    );
}

    