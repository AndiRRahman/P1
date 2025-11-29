'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, collectionGroup } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Order } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

interface Stats {
    totalRevenue: number;
    totalSales: number;
    newOrders: number;
    totalProducts: number;
    totalCustomers: number;
}

export default function DashboardPage() {
    const firestore = useFirestore();
    const [stats, setStats] = useState<Stats>({ totalRevenue: 0, totalSales: 0, newOrders: 0, totalProducts: 0, totalCustomers: 0 });
    const [salesData, setSalesData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore) return;

        const productsQuery = query(collection(firestore, 'products'));
        const ordersQuery = query(collectionGroup(firestore, 'orders'));
        const usersQuery = query(collection(firestore, 'users'));

        const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
            setStats(prev => ({ ...prev, totalProducts: snapshot.size }));
            setLoading(false);
        });
        
        const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
            const customerCount = snapshot.docs.filter(doc => doc.data().role !== 'admin').length;
            setStats(prev => ({ ...prev, totalCustomers: customerCount }));
            setLoading(false);
        });

        const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
            const orders: Order[] = [];
            snapshot.forEach(doc => {
                orders.push({ id: doc.id, ...doc.data() } as Order);
            });
            
            const totalRevenue = orders.reduce((sum, order) => (order.status === 'Delivered' || order.status === 'Shipped') ? sum + order.totalAmount : sum, 0);
            const totalSales = orders.filter(order => order.status === 'Delivered' || order.status === 'Shipped').length;
            const newOrders = orders.filter(order => order.status === 'Pending').length;
            
            setStats(prev => ({ ...prev, totalRevenue, totalSales, newOrders }));

            const monthlySales = orders.reduce((acc, order) => {
                const orderDate = (order.orderDate as any)?.toDate ? (order.orderDate as any).toDate() : new Date(order.orderDate);
                if ((order.status === 'Delivered' || order.status === 'Shipped') && orderDate instanceof Date) {
                    const month = orderDate.toLocaleString('default', { month: 'short' });
                    acc[month] = (acc[month] || 0) + order.totalAmount;
                }
                return acc;
            }, {} as Record<string, number>);

            const chartData = Object.entries(monthlySales).map(([name, sales]) => ({ name, sales }));
            setSalesData(chartData);

            setLoading(false);
        });

        return () => {
            unsubProducts();
            unsubOrders();
            unsubUsers();
        }
    }, [firestore]);

    if (loading) {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sales</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.totalSales}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

        </div>
    );
}
