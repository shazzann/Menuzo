"""Run billing fixtures in a temporary Docker database; no project credentials used."""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
CONTAINER = 'supabase_db_Kimi_Agent_MenuCard_Platform_UI_Flow'
DATABASE = 'menuzo_billing_test'

def expand(path):
    lines = []
    for line in path.read_text(encoding='utf-8').splitlines():
        if line.startswith('\\ir '):
            lines.append(expand((path.parent / line[4:].strip()).resolve()))
        else:
            lines.append(line)
    return '\n'.join(lines)

def run(args, **kwargs):
    return subprocess.run(['docker', 'exec', '-i', CONTAINER, *args], text=True,
                          encoding='utf-8', capture_output=True, **kwargs)

if __name__ == '__main__':
    # CREATE fails if this database already exists; never erase someone else's data.
    created = run(['createdb', '-U', 'postgres', DATABASE])
    if created.returncode:
        raise SystemExit('Could not create disposable test database: ' + created.stderr)
    try:
        result = run(['psql', '-X', '-U', 'postgres', '-d', DATABASE, '-v', 'ON_ERROR_STOP=1'],
                     input=expand(ROOT / 'tests/company-shop-history-db.sql'))
        print(result.stdout[-2200:])
        if result.returncode:
            print(result.stderr)
            raise SystemExit(result.returncode)
        print('Customer and company billing database checks passed.')
    finally:
        cleanup = run(['dropdb', '-U', 'postgres', DATABASE])
        if cleanup.returncode:
            print('Test database cleanup failed: ' + cleanup.stderr)
