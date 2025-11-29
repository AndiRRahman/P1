'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Crown, LayoutDashboard, Package, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                <Crown className="h-6 w-6 text-primary" />
                <span className="font-headline">Admin Panel</span>
            </Link>
        </div>
        <nav className="flex-grow px-4 py-4">
            <ul className="space-y-1">
                {navItems.map((item) => (
                    <li key={item.href}>
                        <Link href={item.href}>
                            <span className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
                                pathname.startsWith(item.href) && 'bg-muted text-primary'
                            )}>
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
        <div className="mt-auto p-4 border-t">
            <Button variant="outline" className="w-full" asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Site
                </Link>
            </Button>
        </div>
    </aside>
  );
}
