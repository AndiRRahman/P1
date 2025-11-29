'use server';

import { z } from 'zod';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/lib/firebase-admin';

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0.01, 'Price must be positive'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Must be a valid URL'),
  imageHint: z.string().optional(),
});

const CreateProduct = ProductSchema.omit({ id: true });
const UpdateProduct = ProductSchema;

export type State = {
  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
    stockQuantity?: string[];
    category?: string[];
    imageUrl?: string[];
  };
  message?: string | null;
};

export async function createProduct(prevState: State, formData: FormData) {
  await initializeAdminApp();
  const db = getFirestore();
  const validatedFields = CreateProduct.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Product.',
    };
  }

  const { name, description, price, stockQuantity, category, imageUrl, imageHint } = validatedFields.data;

  try {
    await addDoc(collection(db, 'products'), {
      name, description, price, stockQuantity, category, imageUrl,
      imageHint: imageHint || `${name.split(' ').slice(0,2).join(' ')}`,
    });
  } catch (error) {
    return { message: 'Database Error: Failed to Create Product.' };
  }

  revalidatePath('/admin/products');
  revalidatePath('/');
  return { message: 'Product created successfully', errors: {} };
}

export async function updateProduct(prevState: State, formData: FormData) {
    await initializeAdminApp();
    const db = getFirestore();
  const validatedFields = UpdateProduct.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Product.',
    };
  }
  
  const { id, ...productData } = validatedFields.data;
  if (!id) {
    return { message: 'Product ID is missing. Failed to Update Product.' };
  }

  try {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, productData);
  } catch (error) {
    return { message: 'Database Error: Failed to Update Product.' };
  }

  revalidatePath('/admin/products');
  revalidatePath(`/products/${id}`);
  revalidatePath('/');
  return { message: 'Product updated successfully', errors: {} };
}


export async function deleteProduct(productId: string) {
    await initializeAdminApp();
    const db = getFirestore();
    try {
        await deleteDoc(doc(db, 'products', productId));
        revalidatePath('/admin/products');
        revalidatePath('/');
        return { success: true, message: 'Product deleted successfully.' };
    } catch (error) {
        return { success: false, message: 'Database Error: Failed to Delete Product.' };
    }
}
