"""Apply only the reviewed menu URL history migration to the linked production project."""
import argparse
import subprocess
from production_billing import ROOT, connection, sql

VERSION = '20261004000001'
VERIFY = """
SELECT to_regclass('public.shop_url_history') AS url_history,
  to_regprocedure('public.resolve_menu_shop_url(text)') AS public_resolver;
SELECT count(*) AS recorded_urls FROM public.shop_url_history;
SELECT count(*) AS open_shop_urls,
  count(*) FILTER (WHERE public.resolve_menu_shop_url(h.slug)->>'id'=h.shop_id::text) AS correctly_resolved_urls
  FROM public.shop_url_history h JOIN public.shops s ON s.id=h.shop_id WHERE s.is_open=true;
SELECT count(*) AS assigned_custom_urls,
  count(*) FILTER (WHERE public.get_shop_menu_url(c.shop_id)->>'menu_slug'=c.slug) AS preferred_custom_urls
  FROM public.shop_custom_urls c;
SELECT has_table_privilege('anon','public.shop_url_history','INSERT') AS anonymous_can_claim_urls;
SELECT version FROM supabase_migrations.schema_migrations WHERE version='20261004000001';
"""

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['inspect', 'check', 'apply', 'verify'])
    args = parser.parse_args()
    env = connection()
    if args.action == 'inspect':
        sql("""
SELECT count(*) AS shops FROM public.shops;
SELECT count(*) AS custom_urls FROM public.shop_custom_urls;
SELECT to_regclass('public.shop_url_history') AS existing_history;
SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 4;
""", env)
    elif args.action == 'verify':
        sql(VERIFY, env)
    else:
        source = (ROOT / 'supabase/migrations' / f'{VERSION}_menu_url_history.sql').read_text(encoding='utf-8')
        statements = '\n'.join(line for line in source.splitlines() if line.strip() not in {'BEGIN;', 'COMMIT;'})
        sql("BEGIN; SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='60s';\n" + statements
            + ('\nROLLBACK;' if args.action == 'check' else '\nCOMMIT;'), env)
        if args.action == 'apply':
            result = subprocess.run(['supabase','migration','repair',VERSION,'--status','applied','--linked'],
                cwd=ROOT,capture_output=True,text=True)
            if result.returncode:
                raise SystemExit('Schema applied; record migration history with supabase migration repair ' + VERSION + ' --status applied --linked.')
            sql(VERIFY, connection())
