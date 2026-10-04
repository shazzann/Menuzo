"""Repair owner analytics access and reporting dates on the linked production project."""
import argparse
import subprocess
from production_billing import ROOT, connection, sql

VERSION = '20261004000002'
VERIFY = """
SELECT count(*) AS owner_read_policies FROM pg_policies
  WHERE schemaname='public' AND tablename='shop_daily_stats'
  AND policyname='Owners can read daily shop statistics';
SELECT count(*) AS stored_daily_rows FROM public.shop_daily_stats;
SELECT pg_get_functiondef('public.increment_shop_visits(uuid,boolean)'::regprocedure) LIKE '%Asia/Colombo%' AS uses_sri_lanka_date;
SELECT has_table_privilege('authenticated','public.shop_daily_stats','INSERT') AS owners_can_forge_counts;
SELECT version FROM supabase_migrations.schema_migrations WHERE version='20261004000002';
"""

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['check', 'apply', 'verify'])
    args = parser.parse_args()
    env = connection()
    if args.action == 'verify':
        sql(VERIFY, env)
    else:
        source = (ROOT / 'supabase/migrations' / f'{VERSION}_shop_analytics_access.sql').read_text(encoding='utf-8')
        statements = '\n'.join(line for line in source.splitlines() if line.strip() not in {'BEGIN;', 'COMMIT;'})
        sql("BEGIN; SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='60s';\n" + statements
            + ('\nROLLBACK;' if args.action == 'check' else '\nCOMMIT;'), env)
        if args.action == 'apply':
            result = subprocess.run(['supabase','migration','repair',VERSION,'--status','applied','--linked'],
                cwd=ROOT,capture_output=True,text=True)
            if result.returncode:
                raise SystemExit('Schema applied; record migration history with supabase migration repair ' + VERSION + ' --status applied --linked.')
            sql(VERIFY, connection())
