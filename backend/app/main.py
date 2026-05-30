"""至远药业 经营数据看板 — FastAPI 后端入口"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .api.router import router
from .api.vault import router as vault_router
from .db import init_db
from smart_analysis.engine import analyze as smart_analyze


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="BL Dashboard API", version="0.3.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(vault_router)


@app.post("/api/analyze")
async def run_analysis(payload: dict):
    result = smart_analyze(payload.get("data", {}), payload.get("question", ""))
    return result


@app.get("/api/health")
async def health():
    return {"status": "ok"}
