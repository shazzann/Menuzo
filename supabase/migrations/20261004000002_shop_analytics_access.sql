BEGIN;

-- The production table had RLS enabled but no owner read policy, so every
-- successful owner query returned an empty array and the charts showed zero.
ALTER TABLE public.shop_daily_stats ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.shop_daily_stats FROM anon, authenticated;
GRANT SELECT ON public.shop_daily_stats TO authenticated;
GRANT ALL ON public.shop_daily_stats TO service_role;
DROP POLICY IF EXISTS "Owners can read daily shop statistics" ON public.shop_daily_stats;
CREATE POLICY "Owners can read daily shop statistics"
  ON public.shop_daily_stats FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.shops s WHERE s.id=shop_id AND s.user_id=(SELECT auth.uid())
  ));

-- Use the same reporting day as the dashboard and Analytics in Sri Lanka.
CREATE OR REPLACE FUNCTION public.increment_shop_visits(p_shop_id uuid, p_is_qr boolean DEFAULT false)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_qr integer:=CASE WHEN p_is_qr THEN 1 ELSE 0 END;
BEGIN
  UPDATE public.shops SET view_count=coalesce(view_count,0)+1,
    qr_scan_count=coalesce(qr_scan_count,0)+v_qr WHERE id=p_shop_id AND is_open=true;
  IF NOT FOUND THEN RETURN; END IF;
  INSERT INTO public.shop_daily_stats(shop_id,date,views,qr_scans)
    VALUES(p_shop_id,(now() AT TIME ZONE 'Asia/Colombo')::date,1,v_qr)
    ON CONFLICT(shop_id,date) DO UPDATE SET views=coalesce(shop_daily_stats.views,0)+1,
      qr_scans=coalesce(shop_daily_stats.qr_scans,0)+v_qr;
END;
$$;
REVOKE ALL ON FUNCTION public.increment_shop_visits(uuid,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_shop_visits(uuid,boolean) TO anon,authenticated,service_role;

COMMIT;
