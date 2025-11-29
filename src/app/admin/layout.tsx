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
    if (isUserLoading || !firestore) {
      return; 
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const checkAdminStatus = async () => {
      const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
      try {
        const docSnap = await getDoc(adminRoleRef);
        if (docSnap.exists()) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push('/');
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
        router.push('/');
      }
    };
    
    checkAdminStatus();

  }, [user, isUserLoading, firestore, router]);
  
  if (isAdmin === null || isUserLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Skeleton className="h-screen w-full" />
        </div>
    );
  }

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

  // This part should ideally not be reached if router.push('/') works correctly,
  // but it's a good fallback.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Access Denied. Redirecting...</p>
    </div>
  );
}
