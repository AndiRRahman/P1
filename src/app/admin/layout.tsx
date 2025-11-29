'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminSidebar from './components/admin-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (isUserLoading || !firestore) return;

      if (!user) {
        router.push('/login');
        return;
      }
      
      const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
      const adminRoleDoc = await getDoc(adminRoleRef);
      
      if (adminRoleDoc.exists()) {
        setIsAdmin(true);
      } else {
        router.push('/');
      }
      setIsCheckingRole(false);
    };

    checkAdminRole();
  }, [user, isUserLoading, router, firestore]);

  if (isUserLoading || isCheckingRole || !isAdmin) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Skeleton className="h-screen w-full" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8 bg-muted/40">
        {children}
      </main>
    </div>
  );
}
