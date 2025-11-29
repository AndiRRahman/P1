'use server';

import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Order } from '@/lib/definitions';
import { getFirestore } from "firebase-admin/firestore";

export async function updateOrderStatus(orderId: string, status: Order['status'], userId: string) {
  try {
    const db = getFirestore();
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    await updateDoc(orderRef, { status });
    revalidatePath('/admin/orders');
    revalidatePath('/profile'); // Revalidate user profile as they can see order status
    return { success: true, message: 'Order status updated successfully.' };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, message: 'Failed to update order status.' };
  }
}
