'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/image-upload';
import { useState, useCallback } from 'react';

// Define the Game interface locally
interface Game {
  id: string;
  title: string;
  yearPublished?: number | null;
  minPlayers?: number | null;
  maxPlayers?: number | null;
  playingTime?: number | null;
}

// Define form data type
type FormValues = {
  gameId: string;
  condition: GameCondition;
  price?: number;
  isFree: boolean;
  shippingOption: ShippingOption;
  description?: string;
  images?: Array<{
    key: string;
    name: string;
    size: number;
    url: string;
  }>;
};

// Define enums locally since we're not importing from @prisma/client
export enum GameCondition {
  MINT = 'MINT',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export enum ShippingOption {
  LOCAL_PICKUP = 'LOCAL_PICKUP',
  NATIONAL = 'NATIONAL',
}

// Extend the File type to include preview and other metadata
type FileWithPreview = File & {
  preview: string;
  key?: string;
  url?: string;
};

// Define schema for image uploads
const imageSchema = z.object({
  key: z.string().optional(),
  name: z.string(),
  size: z.number(),
  url: z.string(),
  preview: z.string().optional(),
  type: z.string().optional(),
});

const formSchema = z.object({
  gameId: z.string().min(1, 'Game is required'),
  condition: z.nativeEnum(GameCondition, {
    required_error: 'Please select a condition',
  }),
  price: z.number().min(0, 'Price must be a positive number').optional(),
  isFree: z.boolean().default(false),
  shippingOption: z.nativeEnum(ShippingOption, {
    required_error: 'Please select a shipping option',
  }),
  description: z.string().optional(),
  images: z.array(imageSchema).max(10, 'You can upload up to 10 images').optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateListingFormProps {
  game: Game;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateListingForm({ game, onSubmit, isSubmitting }: CreateListingFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any, // Using 'any' as a workaround for the type mismatch
    defaultValues: {
      gameId: game.id,
      condition: GameCondition.GOOD,
      shippingOption: ShippingOption.LOCAL_PICKUP,
      isFree: false,
      images: [],
    },
  });

  const watchIsFree = form.watch('isFree');
  
  // Handle file uploads
  const handleFileUpload = useCallback((acceptedFiles: File[]) => {
    setIsUploading(true);
    
    // Map the files to include preview URLs and required metadata
    const filesWithPreview = acceptedFiles.map(file => {
      const preview = URL.createObjectURL(file);
      return Object.assign(file, {
        preview,
        key: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }) as FileWithPreview;
    });
    
    setUploadedFiles(prev => [...prev, ...filesWithPreview]);
    setIsUploading(false);
  }, []);
  
  // Handle file removal
  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      const [removed] = newFiles.splice(index, 1);
      // Clean up object URL
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newFiles;
    });
  }, []);
  
  // Handle form submission
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      // Prepare the form data with uploaded files
      const formData = {
        ...data,
        images: uploadedFiles.map(file => ({
          key: file.key || `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          url: file.url || URL.createObjectURL(file),
        })),
      };
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{game.title}</h3>
        <p className="text-sm text-muted-foreground">
          {game.yearPublished && `(${game.yearPublished})`} • {game.minPlayers}-{game.maxPlayers} players • {game.playingTime} min
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="condition">Condition</Label>
          <select
            id="condition"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            {...form.register('condition')}
          >
            {Object.values(GameCondition).map((condition) => (
              <option key={condition} value={condition}>
                {condition.replace('_', ' ')}
              </option>
            ))}
          </select>
          {form.formState.errors.condition && (
            <p className="mt-1 text-sm text-red-500">
              {form.formState.errors.condition.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isFree"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            {...form.register('isFree')}
          />
          <Label htmlFor="isFree" className="text-sm font-medium">
            This is a free listing
          </Label>
        </div>

        {!watchIsFree && (
          <div>
            <Label htmlFor="price">Price (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              {...form.register('price', { valueAsNumber: true })}
            />
            {form.formState.errors.price && (
              <p className="mt-1 text-sm text-red-500">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>
        )}

        <div>
          <Label>Shipping Options</Label>
          <div className="mt-2 space-y-2">
            {Object.values(ShippingOption).map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={option}
                  value={option}
                  className="h-4 w-4 text-primary focus:ring-primary"
                  {...form.register('shippingOption')}
                />
                <Label htmlFor={option} className="text-sm font-normal">
                  {option === ShippingOption.LOCAL_PICKUP ? 'Local Pickup' : 'National Shipping'}
                </Label>
              </div>
            ))}
          </div>
          {form.formState.errors.shippingOption && (
            <p className="mt-1 text-sm text-red-500">
              {form.formState.errors.shippingOption.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Additional Notes (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add any additional details about the condition or other information..."
            className="mt-1"
            {...form.register('description')}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <div className="space-y-4">
          <div>
            <Label>Upload Images</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Add up to 10 images of the game. The first image will be used as the main image.
            </p>
            <div className="mt-4">
              <ImageUpload
                value={uploadedFiles}
                onChange={handleFileUpload}
                disabled={isUploading}
                maxFiles={10}
                maxSize={4 * 1024 * 1024} // 4MB
              />
              {uploadedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={file.key || index} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-lg border">
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading}
            className="w-full"
          >
            {isSubmitting ? 'Creating...' : 'Create Listing'}
          </Button>
        </div>
      </div>
    </form>
  );
}
