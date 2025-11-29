'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from './components/admin-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Jangan lakukan apa-apa jika status user masih loading.
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
      const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
      getDoc(adminRoleRef).then(docSnap => {
        const isAdminUser = docSnap.exists();
        setIsAdmin(isAdminUser);
        // 4. Jika user bukan admin, langsung redirect dari sini.
        if (!isAdminUser) {
          router.push('/');
        }
      }).catch(error => {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        router.push('/');
      });
    }
  }, [user, isUserLoading, firestore, router]);
  
  // Tampilkan skeleton jika user masih loading atau status admin belum terverifikasi.
  if (isUserLoading || isAdmin === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  // Jika semua pengecekan selesai dan user adalah admin, tampilkan layout admin.
  // Pengecekan `!isAdmin` akan ditangani oleh useEffect di atas.
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
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Access Denied. Redirecting...</p>
    </div>
  );
}
