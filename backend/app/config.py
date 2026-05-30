import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/bl_dashboard")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
