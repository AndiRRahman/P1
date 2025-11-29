'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from './components/admin-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from '@/lib/definitions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Jangan lakukan apa-apa jika user masih loading
    if (isUserLoading) {
      return;
    }

    // 2. Jika loading selesai dan tidak ada user, redirect ke login.
    if (!user) {
      router.push('/login');
      return;
    }
    
    // 3. Jika ada user dan firestore tersedia, periksa status admin.
    if (user && firestore) {
      // **PERBAIKAN UTAMA: Periksa field 'role' di dalam dokumen 'users/{userId}'**
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          const isAdminUser = userData.role === 'admin';
          setIsAdmin(isAdminUser);
           // 4. Jika user bukan admin, langsung redirect dari sini.
          if (!isAdminUser) {
            router.push('/');
          }
        } else {
          // User doc tidak ditemukan, anggap bukan admin
          setIsAdmin(false);
          router.push('/');
        }
      }).catch(error => {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        router.push('/');
      });
    }
  }, [user, isUserLoading, firestore, router]);
  
  // Tampilkan skeleton jika user masih loading ATAU status admin belum terverifikasi.
  if (isUserLoading || isAdmin === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  // Jika semua pengecekan selesai dan user adalah admin, tampilkan layout admin.
  if (isAdmin) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 bg-muted/40">
          {children}
        </main>
      </div>
    );
  }

  // Fallback jika user bukan admin, sambil menunggu redirect dari useEffect.
  // Ini seharusnya tidak akan pernah ditampilkan jika logika di atas benar.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Access Denied. Redirecting...</p>
    </div>
  );
}
