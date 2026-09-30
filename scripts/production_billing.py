"""Apply only the reviewed customer billing schema/config to the linked production project.

Uses the Supabase CLI's temporary database login in memory. No keys or database
passwords are printed, written to disk, or passed as command-line arguments.
"""
import argparse
import os
from pathlib import Path
import shlex
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PROJECT = 'jzlfjrwhfcjcqeyculbd'


def connection():
    linked = ROOT / 'supabase/.temp/project-ref'
    if not linked.exists() or linked.read_text().strip() != PROJECT:
        raise SystemExit(f'Link to production project {PROJECT} before running this script.')
    result = subprocess.run(
        ['supabase', 'db', 'dump', '--linked', '--schema', 'public', '--dry-run'],
        cwd=ROOT, capture_output=True, text=True, encoding='utf-8',
    )
    if result.returncode:
        raise SystemExit('Could not obtain the production connection. Check your Supabase login.')
    values = {}
    for line in result.stdout.splitlines():
        if line.strip().startswith('export '):
            for assignment in shlex.split(line.strip()[7:]):
                if '=' in assignment:
                    key, value = assignment.split('=', 1)
                    if key in {'PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'}:
                        values[key] = value
    if len(values) != 5 or not values['PGPASSWORD']:
        raise SystemExit('CLI did not provide a complete temporary database connection.')
    if PROJECT not in values['PGHOST'] and PROJECT not in values['PGUSER']:
        raise SystemExit('The generated database connection does not match production.')
    if values['PGHOST'] in {'localhost', '127.0.0.1', '::1'}:
        raise SystemExit('Refusing to run production configuration against localhost.')
    return {**os.environ, **values, 'PGSSLMODE': 'require', 'PGCLIENTENCODING': 'UTF8'}


def sql(query, env):
    psql = shutil.which('psql')
    if not psql:
        raise SystemExit('Install the PostgreSQL psql client before running this script.')
    result = subprocess.run([psql, '-X', '-v', 'ON_ERROR_STOP=1'], input='SET ROLE postgres;\n' + query,
                            env=env, text=True, encoding='utf-8', capture_output=True)
    print(result.stdout)
    if result.returncode:
        print(result.stderr)
        raise SystemExit(result.returncode)


VERIFY = """
SELECT id, label, months, amount, currency, active
FROM public.billing_periods WHERE id IN ('monthly', 'yearly') ORDER BY months;
SELECT bank_name, account_name, right(account_number, 4) AS account_last_four,
       branch, whatsapp_number, enabled FROM public.bank_transfer_settings WHERE id;
SELECT version, name FROM supabase_migrations.schema_migrations
WHERE version = '20260929000001';
"""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['inspect', 'check', 'apply', 'verify'])
    action = parser.parse_args().action
    env = connection()
    if action == 'inspect':
        sql("""
SELECT table_name, column_name, data_type FROM information_schema.columns
WHERE table_schema = 'supabase_migrations' AND table_name = 'schema_migrations'
ORDER BY ordinal_position;
SELECT to_regclass('public.billing_periods') AS billing_periods,
       to_regclass('public.billing_payment_requests') AS customer_requests,
       to_regclass('public.payment_requests') AS existing_requests;
SELECT count(*) AS existing_payment_request_count FROM public.payment_requests;
""", env)
    elif action in {'check', 'apply'}:
        migration = (ROOT / 'supabase/migrations/20260929000001_customer_billing.sql').read_text(encoding='utf-8')
        config = (ROOT / 'supabase/production/configure_billing.sql').read_text(encoding='utf-8')
        # Both schema and configuration publish atomically. The check action
        # executes identical SQL but rolls it back before any customer can see it.
        statements = []
        for source in (migration, config):
            statements.append('\n'.join(line for line in source.splitlines()
                                         if line.strip() not in {'BEGIN;', 'COMMIT;'}))
        sql('BEGIN;\n' + '\n'.join(statements) + ('\nROLLBACK;' if action == 'check' else '\nCOMMIT;'), env)
        if action == 'apply':
            result = subprocess.run(['supabase', 'migration', 'repair', '20260929000001',
                                     '--status', 'applied', '--linked'], cwd=ROOT, capture_output=True, text=True)
            if result.returncode:
                raise SystemExit('Billing applied, but migration history could not be recorded. Run supabase migration repair before further deployments.')
            print('Recorded applied customer billing migration.')
            sql(VERIFY, connection())
    else:
        sql(VERIFY, env)


if __name__ == '__main__':
    main()
