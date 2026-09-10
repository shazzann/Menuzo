CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'LKR',
  reference text,
  proof_url text,
  status payment_status NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES public.admins(id),
  reviewed_at timestamptz,
  rejection_reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Customer can read own payment requests
CREATE POLICY "Customers can view their own payment requests"
  ON public.payment_requests FOR SELECT
  USING (profile_id = auth.uid());

-- Customer can create payment requests for their own shop
CREATE POLICY "Customers can create payment requests"
  ON public.payment_requests FOR INSERT
  WITH CHECK (
    profile_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM public.shops WHERE id = shop_id AND user_id = auth.uid())
  );

-- Admins can read all payment requests
CREATE POLICY "Admins can view all payment requests"
  ON public.payment_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

-- Admins can update payment requests (approve/reject)
CREATE POLICY "Admins can update payment requests"
  ON public.payment_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_payment_requests_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER payment_requests_updated_at
  BEFORE UPDATE ON public.payment_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_payment_requests_updated_at();
