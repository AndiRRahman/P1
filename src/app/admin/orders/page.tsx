'use client';
import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import type { Order } from '@/lib/definitions';
import { useState, useEffect } from 'react';
import { collectionGroup, onSnapshot, orderBy, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/definitions';

export default function AdminOrdersPage() {
    const firestore = useFirestore();
    const { user: adminUser } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !adminUser) return;

        const ordersQuery = query(collectionGroup(firestore, "orders"), orderBy("orderDate", "desc"));
        
        const unsubscribe = onSnapshot(ordersQuery, async (querySnapshot) => {
            const fetchedOrders: Order[] = [];
            for (const orderDoc of querySnapshot.docs) {
                const orderData = orderDoc.data() as Omit<Order, 'id'>;
                const userDocRef = doc(firestore, 'users', orderData.userId);
                const userDoc = await getDoc(userDocRef);
                const userData = userDoc.data() as User;
                
                fetchedOrders.push({ 
                    id: orderDoc.id, 
                    ...orderData,
                    User: userData
                });
            }
            setOrders(fetchedOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, adminUser]);

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
