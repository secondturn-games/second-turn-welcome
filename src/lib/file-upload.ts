import { utapi } from '@/app/api/uploadthing/core';

export interface UploadedFile {
  key: string;
  name: string;
  size: number;
  url: string;
}

type UploadResponse = {
  data: {
    key: string;
    name: string;
    size: number;
    url: string;
  } | null;
  error: Error | null;
};

export async function uploadFiles(files: File[]): Promise<UploadedFile[]> {
  try {
    // Convert File objects to the format expected by UploadThing
    const uploadResponses = await Promise.all(
      files.map(file => 
        utapi.uploadFiles({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
        } as unknown as File)
      )
    );
    
    // Process the responses and map to our UploadedFile type
    const uploadedFiles: UploadedFile[] = [];
    
    for (const response of uploadResponses) {
      if (response.error) {
        console.error('Error uploading file:', response.error);
        continue;
      }
      
      if (response.data) {
        uploadedFiles.push({
          key: response.data.key,
          name: response.data.name,
          size: response.data.size,
          url: response.data.url,
        });
      }
    }
    
    if (uploadedFiles.length === 0) {
      throw new Error('No files were successfully uploaded');
    }
    
    return uploadedFiles;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw new Error('Failed to upload files');
  }
}

export async function deleteFiles(fileKeys: string | string[]): Promise<{ success: boolean; error?: Error }> {
  try {
    const keys = Array.isArray(fileKeys) ? fileKeys : [fileKeys];
    if (keys.length === 0) {
      return { success: true };
    }
    
    const result = await utapi.deleteFiles(keys);
    return { success: result.success };
  } catch (error) {
    console.error('Error deleting files:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error deleting files')
    };
  }
}

export function getFileUrl(fileKey: string): string {
  return `https://utfs.io/f/${fileKey}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
