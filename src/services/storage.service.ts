import { uploadImageToCloudinary } from '@/lib/cloudinary';

export const StorageService = {
  /**
   * Uploads an image to Cloudinary (replacing Supabase Storage)
   * @param file The file to upload
   * @param bucket The storage bucket (ignored for Cloudinary, kept for API compatibility)
   * @param path The path inside the bucket (ignored for Cloudinary, kept for API compatibility)
   */
  async uploadImage(file: File): Promise<{ url: string, path: string }> {
    try {
      const response = await uploadImageToCloudinary(file);
      return {
        url: response.secure_url,
        path: response.public_id
      };
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw error;
    }
  },

  async deleteImage( path: string): Promise<boolean> {
    // Note: Cloudinary unsigned uploads cannot be securely deleted from the frontend.
    // This is a no-op for now to maintain API compatibility.
    console.log('Delete image requested for', path, '- skipped (unsupported for unsigned Cloudinary uploads)');
    return true;
  }
};
