import { supabase } from '@/lib/supabase';

export const StorageService = {
  /**
   * Uploads an image to Supabase Storage
   * @param file The file to upload
   * @param bucket The storage bucket (e.g. 'restaurant-assets')
   * @param path The path inside the bucket (e.g. 'shop_id/logo/image.jpg')
   */
  async uploadImage(file: File, bucket: string, path: string): Promise<{ url: string, path: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      path: filePath
    };
  },

  async deleteImage(bucket: string, path: string): Promise<boolean> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
      
    if (error) {
      console.error('Failed to delete image:', error);
      return false;
    }
    return true;
  }
};
