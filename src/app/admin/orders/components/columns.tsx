'use client';

import { ColumnDef } from '@tanstack/react-table';
import type { Order } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTransition } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { updateOrderStatus } from '../actions';

const OrderStatusSelector = ({ order }: { order: Order }) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-400/20 text-yellow-600 border-yellow-400/30 hover:bg-yellow-400/30';
            case 'Shipped': return 'bg-blue-400/20 text-blue-600 border-blue-400/30 hover:bg-blue-400/30';
            case 'Delivered': return 'bg-green-400/20 text-green-600 border-green-400/30 hover:bg-green-400/30';
            case 'Cancelled': return 'bg-red-400/20 text-red-600 border-red-400/30 hover:bg-red-400/30';
            default: return 'bg-gray-400/20 text-gray-600 border-gray-400/30 hover:bg-gray-400/30';
        }
    }
    
    const onStatusChange = (newStatus: Order['status']) => {
        startTransition(async () => {
            const result = await updateOrderStatus(order.id, newStatus, order.userId);
            if (result.success) {
                toast({ title: 'Success', description: 'Order status has been updated.' });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.message });
            }
        });
    }

    return (
        <div className="relative">
             <Select defaultValue={order.status} onValueChange={(value) => onStatusChange(value as Order['status'])} disabled={isPending}>
                <SelectTrigger className={cn("h-8 w-32 border", getStatusVariant(order.status))}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>
            {isPending && <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
    )
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell: ({row}) => <span className="font-mono">#{(row.original.id || '').slice(0,7)}</span>
  },
   {
    id: 'customerName',
    accessorFn: row => row.User?.name,
    header: 'Customer',
  },
  {
    accessorKey: 'orderDate',
    header: 'Date',
    cell: ({row}) => new Date(row.original.orderDate).toLocaleDateString()
  },
  {
    accessorKey: 'totalAmount',
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const total = parseFloat(row.getValue('totalAmount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(total);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const order = row.original;
        return <OrderStatusSelector order={order} />
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View Order Details</DropdownMenuItem>
            <DropdownMenuItem>View Customer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

    