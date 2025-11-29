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
    // Jangan lakukan apa-apa jika user masih loading atau firestore belum siap.
    if (isUserLoading || !firestore) {
      return; 
    }

    // Jika loading selesai dan tidak ada user, redirect ke login.
    if (!user) {
      router.push('/login');
      return;
    }

    // Jika user ada, periksa status admin.
    const checkAdminStatus = async () => {
      const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
      try {
        const docSnap = await getDoc(adminRoleRef);
        setIsAdmin(docSnap.exists());
      } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false); // Jika error, anggap bukan admin
      }
    };
    
    checkAdminStatus();

  }, [user, isUserLoading, firestore, router]);
  
  // State 1: Loading User atau Firestore, tampilkan skeleton.
  if (isUserLoading || isAdmin === null) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Skeleton className="h-screen w-full" />
        </div>
    );
  }

  // State 2: Loading selesai, dan user BUKAN admin. Redirect.
  if (!isAdmin) {
    router.push('/');
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Access Denied. Redirecting...</p>
        </div>
    );
  }

  // State 3: Loading selesai dan user ADALAH admin. Tampilkan layout.
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 bg-muted/40">
        {children}
      </main>
    </div>
  );
}
