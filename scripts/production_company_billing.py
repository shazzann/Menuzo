"""Publish the company billing migration only; never replay older production migrations."""
import argparse
import subprocess
from production_billing import ROOT, connection, sql

VERSION = '20260930000001'
VERIFY = """
SELECT to_regprocedure('public.admin_review_billing_payment(uuid,text,text,text,boolean)') AS review_api,
       to_regprocedure('public.admin_list_shop_subscriptions(text,integer)') AS subscriptions_api;
SELECT has_function_privilege('anon', 'public.admin_review_billing_payment(uuid,text,text,text,boolean)', 'EXECUTE') AS anonymous_can_review,
       has_function_privilege('authenticated', 'public.admin_review_billing_payment(uuid,text,text,text,boolean)', 'EXECUTE') AS authenticated_can_call_guarded_review;
SELECT version FROM supabase_migrations.schema_migrations WHERE version = '20260930000001';
"""

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['check', 'apply', 'verify'])
    action = parser.parse_args().action
    env = connection()
    if action == 'verify':
        sql(VERIFY, env)
    else:
        source = (ROOT / f'supabase/migrations/{VERSION}_company_billing.sql').read_text(encoding='utf-8')
        statements = '\n'.join(line for line in source.splitlines() if line.strip() not in {'BEGIN;', 'COMMIT;'})
        # Keep locks bounded so deployment cannot hold up customer traffic indefinitely.
        sql("BEGIN; SET LOCAL lock_timeout = '5s'; SET LOCAL statement_timeout = '60s';\n" + statements
            + ('\nROLLBACK;' if action == 'check' else '\nCOMMIT;'), env)
        if action == 'apply':
            result = subprocess.run(['supabase','migration','repair',VERSION,'--status','applied','--linked'],
                                    cwd=ROOT, capture_output=True, text=True)
            if result.returncode:
                raise SystemExit('Schema applied; record migration history with supabase migration repair ' + VERSION + ' --status applied --linked.')
            sql(VERIFY, connection())
