import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
}

export function ImageUpload({ value, onChange, onRemove, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Add basic file validation here (size, type)
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      const result = await uploadImageToCloudinary(file);
      onChange(result.secure_url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be selected again if needed
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {value ? (
        <div className="relative group w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
          <img 
            src={value} 
            alt="Uploaded" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              title="Change Image"
            >
              <UploadCloud size={20} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (onRemove) onRemove();
                else onChange('');
              }}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Remove Image"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => !isUploading && inputRef.current?.click()}
          className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isUploading ? 'bg-gray-50 border-gray-300 dark:bg-gray-900 dark:border-gray-700 cursor-not-allowed' : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-gray-500">
              <Loader2 className="w-8 h-8 mb-2 animate-spin text-primary" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Click to upload image</span>
              <span className="text-xs mt-1 opacity-70">PNG, JPG or WEBP (Max 5MB)</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
    </div>
  );
}
