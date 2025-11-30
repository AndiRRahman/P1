'use server';

import { z } from 'zod';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
  success?: boolean;
  role?: 'admin' | 'customer';
};

async function isAdminUserPresent(db: admin.firestore.Firestore): Promise<boolean> {
  const usersRef = db.collection('users');
  const adminSnapshot = await usersRef.where('role', '==', 'admin').limit(1).get();
  return !adminSnapshot.empty;
}

export async function registerUser(prevState: State, formData: FormData): Promise<State> {
  await initializeAdminApp();
  const db = getFirestore();
  const auth = admin.auth();

  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields.',
      success: false,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const adminExists = await isAdminUserPresent(db);
    const role = adminExists ? 'customer' : 'admin';

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    const userDocRef = db.collection('users').doc(userRecord.uid);
    await userDocRef.set({
      id: userRecord.uid,
      email: email,
      name: name,
      role: role,
      address: '',
      phone: '',
    });
    
    revalidatePath('/admin/users'); // Example path revalidation

    return {
      message: 'User registered successfully.',
      success: true,
      role: role
    };

  } catch (error: any) {
    console.error('Registration Error:', error);
    let errorMessage = 'An unexpected error occurred during registration.';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'This email address is already in use.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    return {
      message: errorMessage,
      success: false,
    };
  }
}

    