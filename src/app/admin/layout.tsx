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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null: checking, true: admin, false: not admin

  useEffect(() => {
    // If user is not loaded and not loading, it means no user is logged in.
    if (!isUserLoading && !user) {
      router.push('/login');
      return;
    }

    const checkAdminRole = async () => {
      if (user && firestore) {
        try {
          const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
          const adminRoleDoc = await getDoc(adminRoleRef);
          
          if (adminRoleDoc.exists()) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            router.push('/'); // Redirect non-admins immediately
          }
        } catch (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
          router.push('/'); // On error, assume not admin and redirect
        }
      }
    };
    
    // Only run the check if the user is loaded
    if (!isUserLoading && user) {
        checkAdminRole();
    }

  }, [user, isUserLoading, router, firestore]);

  // While checking user or admin status, show a full-page skeleton loader.
  // This prevents rendering any child components until access is confirmed.
  if (isUserLoading || isAdmin === null) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Skeleton className="h-screen w-full" />
        </div>
    );
  }

  // Only if isAdmin is explicitly true, render the admin layout.
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

  // In other cases (like being a non-admin), the redirect has already been triggered.
  // This loader acts as a fallback while the redirect is in flight.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Skeleton className="h-screen w-full" />
    </div>
  );
}
