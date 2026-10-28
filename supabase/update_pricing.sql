-- Menuzo Pro Subscription Pricing Update
-- Regular monthly: LKR 3,500.00
-- Regular yearly: LKR 33,600.00 (Save LKR 8,400.00/year)

UPDATE public.billing_periods
SET amount = 3500.00,
    currency = 'LKR',
    active = true
WHERE id = 'monthly';

UPDATE public.billing_periods
SET amount = 33600.00,
    currency = 'LKR',
    active = true
WHERE id = 'yearly';

-- Verification
SELECT id, label, months, amount, currency, active
FROM public.billing_periods
WHERE id IN ('monthly', 'yearly')
ORDER BY months;

