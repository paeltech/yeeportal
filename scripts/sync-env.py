#!/usr/bin/env python3
"""Write Supabase env vars from CLI (run locally after supabase link)."""
import json
import subprocess
from pathlib import Path

PROJECT_REF = "aalavesizndrpvxwbjos"
URL = f"https://{PROJECT_REF}.supabase.co"
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

result = subprocess.run(
    ["supabase", "projects", "api-keys", "--project-ref", PROJECT_REF, "-o", "json"],
    capture_output=True,
    text=True,
    check=True,
)
keys = json.loads(result.stdout)
anon = next(k["api_key"] for k in keys if k["name"] == "anon")
service = next(k["api_key"] for k in keys if k["name"] == "service_role")
publishable = next(
    (k["api_key"] for k in keys if k["name"] == "default" and k["api_key"].startswith("sb_publishable_")),
    anon,
)

content = f"""# Supabase — auto-synced via scripts/sync-env.py
SUPABASE_URL={URL}
SUPABASE_ANON_KEY={anon}
SUPABASE_SERVICE_ROLE_KEY={service}

# Vite client (browser)
VITE_SUPABASE_URL={URL}
VITE_SUPABASE_ANON_KEY={anon}

# Legacy / Lovable compatibility
NEXT_PUBLIC_SUPABASE_URL={URL}
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY={publishable}

# App
PUBLIC_APP_URL=http://localhost:5173
DEV_BYPASS_AUTH=false

# Email (optional — document download emails)
# RESEND_API_KEY=
# RESEND_FROM_EMAIL=YEE Portal <documents@yee.or.tz>
"""

ENV_PATH.write_text(content)
print(f"Updated {ENV_PATH} (Supabase URL + keys; DEV_BYPASS_AUTH=false)")
