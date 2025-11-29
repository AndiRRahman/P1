'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Order } from '@/lib/definitions';

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
    revalidatePath('/admin/orders');
    revalidatePath('/profile'); // Revalidate user profile as they can see order status
    return { success: true, message: 'Order status updated successfully.' };
  } catch (error) {
    console.error('Error updating order status:', error);
    // This is a server-side error, so we can't return a complex object to the client directly
    // unless using useFormState. For this simple action, we'll just log it.
    // The client will handle UI feedback.
    return { success: false, message: 'Failed to update order status.' };
  }
}
