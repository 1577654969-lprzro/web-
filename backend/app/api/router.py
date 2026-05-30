"""FastAPI 路由 — 上传 + 解析 + 数据持久化（仅 Excel）"""

import json
import uuid
import threading
from pathlib import Path
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse

from file_parser import read_excel, transform

router = APIRouter(prefix="/api")
DATA_DIR = Path(__file__).parent.parent.parent / "data"
UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)

# ── 后台任务系统 ────────────────────────────────
_jobs: dict[str, dict] = {}
_lock = threading.Lock()


def _parse_excel_job(job_id: str, filepath: str):
    try:
        with _lock:
            _jobs[job_id]["status"] = "parsing"
        raw = read_excel(str(filepath))
        with _lock:
            _jobs[job_id]["status"] = "transforming"
        data = transform(raw)
        with _lock:
            _jobs[job_id]["status"] = "done"
            _jobs[job_id]["data"] = data
    except Exception as e:
        with _lock:
            _jobs[job_id]["status"] = "error"
            _jobs[job_id]["error"] = str(e)


@router.post("/upload/excel")
async def upload_excel(file: UploadFile = File(...)):
    path = UPLOAD_DIR / file.filename
    content = await file.read()
    path.write_bytes(content)

    job_id = uuid.uuid4().hex[:12]
    with _lock:
        _jobs[job_id] = {"status": "uploaded", "filename": file.filename}

    t = threading.Thread(target=_parse_excel_job, args=(job_id, str(path)), daemon=True)
    t.start()

    return {"status": "ok", "job_id": job_id}


@router.get("/job/{job_id}")
async def get_job(job_id: str):
    with _lock:
        job = _jobs.get(job_id)
    if not job:
        return JSONResponse({"status": "not_found"}, status_code=404)
    resp = {"job_id": job_id, "status": job["status"]}
    if job["status"] == "done":
        resp["data"] = job["data"]
    elif job["status"] == "error":
        resp["error"] = job.get("error", "unknown")
    return resp


@router.post("/data/submit")
async def submit_batch(payload: dict):
    data = payload.get("data", payload)
    out = DATA_DIR / "dashboard.json"
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"status": "ok", "file": str(out)}


@router.get("/data/load")
async def load_data():
    out = DATA_DIR / "dashboard.json"
    if out.exists():
        return {"status": "ok", "data": json.loads(out.read_text(encoding="utf-8"))}
    return {"status": "empty", "data": None}


@router.get("/health")
async def health():
    return {"status": "ok"}
