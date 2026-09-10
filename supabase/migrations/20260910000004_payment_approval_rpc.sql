-- Create function to securely approve payments
CREATE OR REPLACE FUNCTION approve_payment(p_payment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_payment record;
    v_admin_id UUID;
    v_plan_id text;
    v_profile_id UUID;
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
        RETURN jsonb_build_object('success', true, 'message', 'Payment already approved.', 'id', v_payment.id);
    END IF;
    
    IF v_payment.status = 'rejected' THEN
        RAISE EXCEPTION 'Payment was already rejected and cannot be approved.';
    END IF;

    v_plan_id := v_payment.plan_id;
    v_profile_id := v_payment.profile_id;

    -- 3. Update payment status
    UPDATE public.payment_requests
    SET status = 'approved',
        reviewed_by = v_admin_id,
        reviewed_at = now()
    WHERE id = p_payment_id;

    -- 4. Update profile subscription details
    -- We'll default to 1 year for enterprise, 1 month for others
    UPDATE public.profiles
    SET subscription_plan = v_plan_id,
        subscription_status = 'active',
        subscription_expires_at = (
            CASE 
                WHEN v_plan_id = 'enterprise' THEN now() + interval '1 year'
                ELSE now() + interval '1 month'
            END
        )
    WHERE id = v_profile_id;

    RETURN jsonb_build_object('success', true, 'message', 'Payment approved and subscription activated.', 'id', v_payment.id);
END;
$$;
