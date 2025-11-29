import type { User as FirebaseUser, UserInfo } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  stockQuantity: number;
  category: string;
};

export type CartItem = {
  id: string; 
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: Timestamp | string;
  shippingAddress: string;
  User: User;
};

export type User = {
  id: string,
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  address: string;
  phone: string;
}

export type AppUser = UserInfo & {
  role: 'guest' | 'customer' | 'admin';
};

export interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

export interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    itemCount: number;
}
