const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface UploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

/**
 * Uploads an image file to Cloudinary using an unsigned upload preset.
 * 
 * @param file The image file to upload
 * @returns The secure URL and public ID of the uploaded image
 */
export async function uploadImageToCloudinary(file: File): Promise<UploadResponse> {
  if (!cloudName || !uploadPreset) {
    throw new Error('Missing Cloudinary environment variables');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
  }

const data = await response.json();
  return data as UploadResponse;
}

/**
 * Generates a SHA-1 signature for Cloudinary API
 */
async function generateSignature(publicId: string, timestamp: number, apiSecret: string): Promise<string> {
  const str = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Extracts public_id from a secure_url
 */
export function getPublicIdFromUrl(url: string): string | null {
  try {
    // Example url: https://res.cloudinary.com/cloudName/image/upload/v1234567/publicId.jpg
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const publicId = lastPart.split('.')[0];
    return publicId || null;
  } catch {
    return null;
  }
}

/**
 * Deletes an image from Cloudinary
 * 
 * @param url The full URL of the image to delete
 */
export async function deleteImageFromCloudinary(url: string): Promise<boolean> {
  if (!url) return false;
  
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return false;

  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('Missing Cloudinary credentials for deletion');
    return false;
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = await generateSignature(publicId, timestamp, apiSecret);

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.result === 'ok';
  } catch (err) {
    console.error('Failed to delete image from Cloudinary:', err);
    return false;
  }
}
