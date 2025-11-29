'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Product } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

type GetColumnsProps = {
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
};

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<Product>[] => [
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => {
        const product = row.original;
        return (
            <div className="flex items-center gap-3">
                <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover"/>
                <span className="font-medium">{product.name}</span>
            </div>
        )
    }
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'price',
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => {
        const stock = row.original.stock;
        return (
             <Badge variant={stock > 10 ? 'default' : stock > 0 ? 'secondary' : 'destructive'} className="bg-opacity-20 border-opacity-30">
                {stock > 0 ? `${stock} in stock` : 'Out of stock'}
            </Badge>
        )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(product)}>
              Edit Product
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(product.id)}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
