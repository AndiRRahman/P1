'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  zip: z.string().min(5, "ZIP code is required"),
  card: z.string().regex(/^\d{16}$/, "Invalid card number"),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Invalid expiry date (MM/YY)"),
  cvc: z.string().regex(/^\d{3,4}$/, "Invalid CVC"),
});

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, itemCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.displayName || '',
      address: '', city: '', zip: '', card: '', expiry: '', cvc: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || user.role === 'guest') {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'Please log in to place an order.' });
        return router.push('/login');
    }
    if (itemCount === 0) {
        toast({ variant: 'destructive', title: 'Empty Cart', description: 'Your cart is empty.' });
        return router.push('/cart');
    }
    
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        customerName: values.name,
        customerEmail: user.email,
        shippingAddress: {
            address: values.address,
            city: values.city,
            zip: values.zip,
        },
        items: cart,
        total: cartTotal,
        status: 'Pending',
        createdAt: new Date().getTime(),
      });

      clearCart();
      router.push('/order-success');
    } catch(error) {
        toast({ variant: 'destructive', title: 'Order Failed', description: 'Could not place your order. Please try again.' });
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8 text-center">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
            <Card>
                <CardHeader><CardTitle>Shipping & Payment</CardTitle></CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <h3 className="font-semibold text-lg">Shipping Address</h3>
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="zip" render={({ field }) => (
                                <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <Separator className="my-6"/>
                        <h3 className="font-semibold text-lg">Payment Details</h3>
                        <FormField control={form.control} name="card" render={({ field }) => (
                            <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder=".... .... .... ...." {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="expiry" render={({ field }) => (
                                <FormItem><FormLabel>Expiry (MM/YY)</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="cvc" render={({ field }) => (
                                <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="..." {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>

                        <Button type="submit" size="lg" className="w-full mt-6" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Placing Order...' : `Place Order ($${cartTotal.toFixed(2)})`}
                        </Button>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {cart.map(item => (
                            <li key={item.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md"/>
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                    <Separator className="my-4"/>
                    <div className="space-y-2">
                        <div className="flex justify-between"><p>Subtotal</p><p>${cartTotal.toFixed(2)}</p></div>
                        <div className="flex justify-between"><p>Shipping</p><p>Free</p></div>
                        <Separator className="my-2"/>
                        <div className="flex justify-between font-bold text-lg"><p>Total</p><p>${cartTotal.toFixed(2)}</p></div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
