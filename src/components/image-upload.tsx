'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';

type FileWithPreview = File & {
  preview: string;
  key?: string;
  url?: string;
};

interface ImageUploadProps {
  onChange: (files: FileWithPreview[]) => void;
  value: FileWithPreview[];
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
}

export function ImageUpload({
  onChange,
  value = [],
  maxFiles = 5,
  maxSize = 4 * 1024 * 1024, // 4MB
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setError(null);

      // Handle file rejections
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0].code === 'file-too-large') {
          setError(`File is too large. Max size is ${maxSize / (1024 * 1024)}MB`);
          return;
        }
        if (rejection.errors[0].code === 'too-many-files') {
          setError(`You can only upload up to ${maxFiles} files`);
          return;
        }
        setError('Invalid file type');
        return;
      }

      // Handle accepted files
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      // Combine with existing files, but don't exceed maxFiles
      const updatedFiles = [...value, ...newFiles].slice(0, maxFiles);
      onChange(updatedFiles);
    },
    [maxFiles, maxSize, onChange, value]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize,
    maxFiles,
    disabled: disabled || value.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = [...value];
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  // Clean up object URLs to avoid memory leaks
  const cleanUp = () => {
    value.forEach((file) => URL.revokeObjectURL(file.preview));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps({
          className: `
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? 'border-primary bg-primary/10'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `,
        })}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-gray-400" />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isDragActive ? (
              <p>Drop the images here</p>
            ) : (
              <p>
                Drag & drop images here, or click to select files
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {`Up to ${maxFiles} images (max ${maxSize / (1024 * 1024)}MB each)`}
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {value.map((file, index) => (
            <div key={file.name} className="relative group">
              <div className="aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={file.preview}
                  alt={file.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
