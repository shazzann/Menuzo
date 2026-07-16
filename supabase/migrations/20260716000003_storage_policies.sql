-- Enable RLS on storage objects if not already
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public can view published images
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id IN ('restaurant-assets', 'food-images') );

-- Authenticated owner can upload and manage their files
-- Menuzo structure usually stores files as 'restaurant-assets/{shop_id}/...'
CREATE POLICY "Owner Upload Access"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    (
      -- Verify the user owns the shop directory they are uploading to
      (auth.uid() IN (
        SELECT user_id FROM public.shops 
        WHERE id::text = (string_to_array(name, '/'))[1]
      ))
      OR 
      -- Allow them to upload to their own user id directory if used
      (string_to_array(name, '/'))[1] = auth.uid()::text
    )
  );

CREATE POLICY "Owner Update Access"
  ON storage.objects FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    (
      (auth.uid() IN (
        SELECT user_id FROM public.shops 
        WHERE id::text = (string_to_array(name, '/'))[1]
      ))
      OR 
      (string_to_array(name, '/'))[1] = auth.uid()::text
    )
  );

CREATE POLICY "Owner Delete Access"
  ON storage.objects FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    (
      (auth.uid() IN (
        SELECT user_id FROM public.shops 
        WHERE id::text = (string_to_array(name, '/'))[1]
      ))
      OR 
      (string_to_array(name, '/'))[1] = auth.uid()::text
    )
  );
