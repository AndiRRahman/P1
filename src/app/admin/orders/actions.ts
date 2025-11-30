'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import type { Order } from '@/lib/definitions';
import { initializeAdminApp } from '@/lib/firebase-admin';


export async function updateOrderStatus(orderId: string, status: Order['status'], userId: string) {
    await initializeAdminApp();
    const db = getFirestore();
  try {
    const orderRef = db.collection('users').doc(userId).collection('orders').doc(orderId);
    await orderRef.update({ status });
    revalidatePath('/admin/orders');
    revalidatePath('/profile'); // Revalidate user profile as they can see order status
    return { success: true, message: 'Order status updated successfully.' };
  } catch (error) {
    console.error('Error updating order status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update order status.';
    return { success: false, message: errorMessage };
  }
}
