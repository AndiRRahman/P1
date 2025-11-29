'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Product } from '@/lib/definitions';
import { createProduct, updateProduct } from '../actions';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { State } from '../actions';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  price: z.coerce.number().min(0.01, 'Price must be a positive number.'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
  category: z.string().min(2, { message: 'Category is required.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  imageHint: z.string().optional(),
});

interface ProductFormProps {
  product?: Product | null;
  onFormAction: () => void;
}

export function ProductForm({ product, onFormAction }: ProductFormProps) {
  const { toast } = useToast();
  const isEditing = !!product;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      stockQuantity: product?.stockQuantity || 0,
      category: product?.category || '',
      imageUrl: product?.imageUrl || '',
      imageHint: product?.imageHint || '',
    },
  });

  const initialState: State = { message: null, errors: {} };
  const action = isEditing ? updateProduct : createProduct;
  const [state, dispatch] = useFormState(action, initialState);

  useEffect(() => {
    if (state?.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
      } else {
        toast({ title: 'Success', description: state.message });
        onFormAction();
        form.reset();
      }
    }
  }, [state, toast, onFormAction, form]);
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form action={dispatch} className="space-y-4">
            {isEditing && <input type="hidden" name="id" value={product.id} />}
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                    <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
            <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="imageHint" render={({ field }) => (
                <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input placeholder="e.g. 'blue shoes'" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>

            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Save Changes' : 'Create Product'}
                </Button>
            </DialogFooter>
        </form>
      </Form>
    </>
  );
}
