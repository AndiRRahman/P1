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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // Use null to represent "checking" state

  useEffect(() => {
    // If user loading state changes, reset admin status to re-check
    setIsAdmin(null);
  }, [user, isUserLoading]);

  useEffect(() => {
    const checkAdminRole = async () => {
      // Don't do anything until user state is resolved and firestore is available
      if (isUserLoading || !firestore) {
        return;
      }

      // If user is not logged in, redirect to login
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Check for admin role
      try {
        const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
        const adminRoleDoc = await getDoc(adminRoleRef);
        
        if (adminRoleDoc.exists()) {
          setIsAdmin(true); // User is an admin
        } else {
          setIsAdmin(false); // User is not an admin, will be redirected
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false); // On error, assume not an admin
      }
    };

    checkAdminRole();
  }, [user, isUserLoading, router, firestore]);

  // Handle redirection after check is complete
  useEffect(() => {
    // We only redirect if isAdmin is explicitly false (not null)
    if (isAdmin === false) {
      router.push('/');
    }
  }, [isAdmin, router]);

  // Show a loading skeleton while checking user status and role
  if (isUserLoading || isAdmin === null) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Skeleton className="h-screen w-full" />
        </div>
    );
  }

  // If user is an admin, render the admin layout
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

  // This will be shown briefly before the redirect happens if not an admin.
  // Or if the redirect logic fails for some reason.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Skeleton className="h-screen w-full" />
    </div>
  );
}
