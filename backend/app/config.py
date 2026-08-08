import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in backend directory first, then root/cwd
backend_dir = Path(__file__).resolve().parent.parent
env_path = backend_dir / ".env"

if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
HF_TOKEN: str = os.getenv("HF_TOKEN", "").strip()
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip()
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173").strip()