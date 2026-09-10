-- Create function to securely reject payments
CREATE OR REPLACE FUNCTION reject_payment(p_payment_id UUID, p_reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_payment record;
    v_admin_id UUID;
BEGIN
    -- 1. Verify caller is an active admin
    SELECT id INTO v_admin_id FROM public.admins WHERE id = auth.uid() AND is_active = true;
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not an active admin.';
    END IF;

    -- 2. Lock the payment record and verify status
    SELECT * INTO v_payment 
    FROM public.payment_requests 
    WHERE id = p_payment_id 
    FOR UPDATE;

    IF v_payment IS NULL THEN
        RAISE EXCEPTION 'Payment request not found.';
    END IF;

    IF v_payment.status = 'approved' THEN
        RAISE EXCEPTION 'Payment was already approved and cannot be rejected.';
    END IF;
    
    IF v_payment.status = 'rejected' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Payment already rejected.', 'id', v_payment.id);
    END IF;

    -- 3. Update payment status
    UPDATE public.payment_requests
    SET status = 'rejected',
        reviewed_by = v_admin_id,
        reviewed_at = now(),
        rejection_reason = p_reason
    WHERE id = p_payment_id;

    RETURN jsonb_build_object('success', true, 'message', 'Payment rejected.', 'id', v_payment.id);
END;
$$;
