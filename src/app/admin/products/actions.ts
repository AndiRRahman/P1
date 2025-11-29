'use server';

import { z } from 'zod';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import type { Media } from '@/lib/definitions';

const MediaSchema = z.object({
  url: z.string().url(),
  type: z.enum(['image', 'video']),
  path: z.string(),
});

const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0.01, 'Price must be positive'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  // Expect a JSON string for media
  media: z.string().transform((str, ctx) => {
    try {
      const parsed = JSON.parse(str);
      const mediaArray = z.array(MediaSchema).safeParse(parsed);
      if (!mediaArray.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid media array format',
        });
        return z.NEVER;
      }
      if (mediaArray.data.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one image or video is required.',
        });
        return z.NEVER;
      }
      return mediaArray.data;
    } catch (e) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid JSON for media' });
      return z.NEVER;
    }
  }),
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
    media?: string[];
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
      message: 'Missing or invalid fields. Failed to Create Product.',
    };
  }

  const { name, description, price, stockQuantity, category, media } = validatedFields.data;

  try {
    await addDoc(collection(db, 'products'), {
      name, description, price, stockQuantity, category, media,
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
      message: 'Missing or invalid fields. Failed to Update Product.',
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


export async function deleteProduct(product: {id: string, media: Media[]}) {
    await initializeAdminApp();
    const db = getFirestore();
    const storage = getStorage();
    const bucket = storage.bucket();

    try {
        // Delete Firestore document
        await deleteDoc(doc(db, 'products', product.id));

        // Delete associated files from Storage
        if (product.media && product.media.length > 0) {
          const deletePromises = product.media.map(m => {
            if (m.path) {
              return bucket.file(m.path).delete().catch(err => console.error(`Failed to delete ${m.path}:`, err));
            }
            return Promise.resolve();
          });
          await Promise.all(deletePromises);
        }

        revalidatePath('/admin/products');
        revalidatePath('/');
        return { success: true, message: 'Product deleted successfully.' };
    } catch (error) {
        return { success: false, message: 'Database Error: Failed to Delete Product.' };
    }
}
