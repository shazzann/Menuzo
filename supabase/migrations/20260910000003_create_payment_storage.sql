-- Create payment_proofs storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment_proofs', 'payment_proofs', false)
ON CONFLICT (id) DO NOTHING;


-- Customers can upload payment proofs
CREATE POLICY "Customers can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment_proofs' AND auth.uid() = owner);

-- Customers can read their own payment proofs
CREATE POLICY "Customers can read own payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment_proofs' AND auth.uid() = owner);

-- Admins can read all payment proofs
CREATE POLICY "Admins can read all payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment_proofs' AND 
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
);
