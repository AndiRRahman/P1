import type { User as FirebaseUser } from 'firebase/auth';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  stock: number;
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
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: number;
};

export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'guest' | 'user' | 'admin';
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
