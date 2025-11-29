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
    // If auth state is still loading, do nothing yet.
    if (isUserLoading) {
      return;
    }

    // If loading is finished and there's no user, redirect to login.
    if (!user) {
      router.push('/login');
      return;
    }
    
    // If user is loaded, check their admin status.
    const checkAdminRole = async () => {
      if (firestore) {
        try {
          const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
          const adminRoleDoc = await getDoc(adminRoleRef);
          
          if (adminRoleDoc.exists()) {
            setIsAdmin(true); // User is an admin
          } else {
            setIsAdmin(false); // User is not an admin
            router.push('/'); // Redirect non-admins immediately
          }
        } catch (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false); // Assume not admin on error
          router.push('/');
        }
      }
    };
    
    checkAdminRole();

  }, [user, isUserLoading, router, firestore]);

  // While checking user authentication OR admin status, show a loader.
  // This is the key change: we wait until isAdmin is NOT null.
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

  // If isAdmin is false, the redirect to '/' is already in progress.
  // This loader acts as a fallback while the redirect happens.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Skeleton className="h-screen w-full" />
    </div>
  );
}
