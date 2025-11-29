'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useActionState, useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Product, Media } from '@/lib/definitions';
import { createProduct, updateProduct } from '../actions';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { State } from '../actions';
import { Progress } from '@/components/ui/progress';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useStorage } from '@/firebase'; // Menggunakan hook kustom
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  price: z.coerce.number().min(0.01, 'Price must be a positive number.'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
  category: z.string().min(2, { message: 'Category is required.' }),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video']),
    path: z.string(),
  })).min(1, 'At least one image or video is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product | null;
  onFormAction: () => void;
}

type UploadStatus = {
  [fileName: string]: {
    progress: number;
    url: string | null;
    error: string | null;
    path: string | null;
  };
};

export function ProductForm({ product, onFormAction }: ProductFormProps) {
  const { toast } = useToast();
  const storage = useStorage(); // Dapatkan instance storage
  const isEditing = !!product;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      stockQuantity: product?.stockQuantity || 0,
      category: product?.category || '',
      media: product?.media || [],
    },
  });

  const initialState: State = { message: null, errors: {} };
  const action = isEditing ? updateProduct : createProduct;
  const [state, dispatch] = useActionState(action, initialState);

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!storage) {
        toast({ variant: 'destructive', title: 'Error', description: 'Storage service not available.' });
        return;
    }
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUploadStatus: UploadStatus = {};
    const uploadPromises: Promise<void>[] = [];
    const newMedia: Media[] = [...form.getValues('media')];

    for (const file of Array.from(files)) {
      const fileName = `${Date.now()}-${file.name}`;
      const storagePath = `products/${fileName}`;
      const storageRef = ref(storage, storagePath);

      newUploadStatus[fileName] = { progress: 0, url: null, error: null, path: null };

      const uploadTask = uploadBytesResumable(storageRef, file);

      const promise = new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadStatus(prev => ({
              ...prev,
              [fileName]: { ...prev[fileName], progress }
            }));
          },
          (error) => {
            setUploadStatus(prev => ({
              ...prev,
              [fileName]: { ...prev[fileName], error: error.message }
            }));
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const fileType = file.type.startsWith('image/') ? 'image' : 'video';

            setUploadStatus(prev => ({
              ...prev,
              [fileName]: { ...prev[fileName], progress: 100, url: downloadURL, path: storagePath }
            }));

            newMedia.push({ url: downloadURL, type: fileType, path: storagePath });
            resolve();
          }
        );
      });
      uploadPromises.push(promise);
    }

    try {
      await Promise.all(uploadPromises);
      form.setValue('media', newMedia, { shouldValidate: true });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Some files failed to upload.' });
    } finally {
      setIsUploading(false);
      // Reset file input
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const removeMedia = (mediaToRemove: Media) => {
    form.setValue('media', form.getValues('media').filter(m => m.url !== mediaToRemove.url), { shouldValidate: true });
    // Note: This does not delete the file from storage. 
    // Deletion will happen if the form is submitted with the removed media, or on product deletion.
  };

  const currentMedia = form.watch('media');

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          action={(formData) => {
            const mediaValue = form.getValues('media');
            formData.append('media', JSON.stringify(mediaValue));
            dispatch(formData);
          }}
          className="space-y-4"
        >
          {isEditing && <input type="hidden" name="id" value={product.id} />}
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="stockQuantity" render={({ field }) => (
              <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          
          <FormField
            control={form.control}
            name="media"
            render={() => (
              <FormItem>
                <FormLabel>Product Media</FormLabel>
                <FormControl>
                  <div>
                    <Input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      ref={fileInputRef}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">Images and Videos</p>
                      </div>
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isUploading && (
            <div className="space-y-2">
              {Object.entries(uploadStatus).map(([fileName, status]) => (
                <div key={fileName}>
                  <p className="text-sm truncate">{fileName}</p>
                  <Progress value={status.progress} className="w-full" />
                  {status.error && <p className="text-sm text-destructive">{status.error}</p>}
                </div>
              ))}
            </div>
          )}

          {currentMedia.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {currentMedia.map((m) => (
                <div key={m.url} className="relative group">
                  {m.type === 'image' ? (
                    <Image src={m.url} alt="product image" width={150} height={150} className="object-cover rounded-md aspect-square" />
                  ) : (
                    <video src={m.url} className="object-cover rounded-md aspect-square w-full h-full" muted loop playsInline />
                  )}
                   <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => removeMedia(m)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                </div>
              ))}
            </div>
          )}


          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
              {(form.formState.isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
