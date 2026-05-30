"""数据中心 — SQLite 存储 + 解析 + 同步（生产稳定版）"""

import json
import asyncio
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, UploadFile, File

from ..db import db_session
from file_parser import read_excel, read_pptx, read_docx, transform
from file_parser.column_matcher import match_report

router = APIRouter(prefix="/api/vault")
VAULT_DIR = Path(__file__).parent.parent.parent / "file_vault"
VAULT_DIR.mkdir(exist_ok=True)


def _parse_file_sync(filepath: Path):
    """同步解析（读取全部 Sheet，Agent 自动匹配列名）"""
    ext = filepath.suffix.lower()
    if ext in (".xlsx", ".xls"):
        raw = read_excel(str(filepath))  # 读取全部 Sheet，不限制
        match_info = {}
        all_cols = set()
        for sheet_name, rows in raw.items():
            if rows:
                cols = list(rows[0].keys())
                all_cols.update(cols)
        mr = match_report(list(all_cols))
        match_info = {
            "matched": len(mr["matched"]),
            "unmatched": len(mr["unmatched"]),
            "unmatched_cols": mr["unmatched"][:10],
            "total_cols": mr["total"],
        }
        data = transform(raw)
        rows = sum(len(v) if isinstance(v, list) else 1 for v in data.values())
        return "excel", json.dumps(data, ensure_ascii=False), rows, None, match_info
    elif ext == ".pptx":
        data = read_pptx(str(filepath))
        return "pptx", json.dumps(data, ensure_ascii=False), len(data), None, {}
    elif ext == ".docx":
        data = read_docx(str(filepath))
        return "docx", json.dumps(data, ensure_ascii=False), data.get("paragraph_count", 0), None, {}
    return None, None, 0, "不支持的文件类型", {}


# ── 上传 ────────────────────────────────────────

@router.post("/upload")
async def vault_upload(file: UploadFile = File(...)):
    dest = VAULT_DIR / file.filename
    content = await file.read()
    dest.write_bytes(content)

    async with db_session() as db:
        cursor = await db.execute(
            "INSERT INTO uploads (filename, size_kb, status) VALUES (?, ?, 'queued')",
            (file.filename, round(len(content) / 1024, 1)),
        )
        record_id = cursor.lastrowid

    return {"status": "ok", "id": record_id, "filename": file.filename}


@router.post("/upload-folder")
async def vault_upload_folder(files: list[UploadFile] = File(...)):
    ids = []
    for file in files:
        dest = VAULT_DIR / file.filename
        content = await file.read()
        dest.write_bytes(content)
        async with db_session() as db:
            cursor = await db.execute(
                "INSERT INTO uploads (filename, size_kb, status) VALUES (?, ?, 'queued')",
                (file.filename, round(len(content) / 1024, 1)),
            )
            ids.append(cursor.lastrowid)
    return {"status": "ok", "count": len(ids), "ids": ids}


# ── 解析处理 ────────────────────────────────────

@router.post("/process")
async def vault_process():
    """后台线程解析，30s 超时保护"""
    async with db_session() as db:
        rows = await db.execute("SELECT id, filename FROM uploads WHERE status = 'queued'")
        queued = [dict(r) for r in await rows.fetchall()]

    done, failed = 0, 0
    for row in queued:
        filepath = VAULT_DIR / row["filename"]
        if not filepath.exists():
            async with db_session() as db:
                await db.execute("UPDATE uploads SET status='error', error='文件不存在' WHERE id=?", (row["id"],))
            failed += 1
            continue

        async with db_session() as db:
            await db.execute("UPDATE uploads SET status='processing' WHERE id=?", (row["id"],))

        try:
            # 线程池执行，不阻塞事件循环，30s 超时
            loop = asyncio.get_event_loop()
            ft, data_json, row_count, error, match_info = await asyncio.wait_for(
                loop.run_in_executor(None, _parse_file_sync, filepath),
                timeout=30.0,
            )
            match_info = match_info or {}
        except asyncio.TimeoutError:
            error = "解析超时(>30s)"
            ft, data_json, row_count, match_info = None, None, 0, {}

        async with db_session() as db:
            if error:
                await db.execute(
                    "UPDATE uploads SET status='error', error=? WHERE id=?",
                    (error, row["id"]),
                )
                failed += 1
            else:
                await db.execute(
                    "UPDATE uploads SET status='done', file_type=?, row_count=?, parsed_data=?, match_info=?, updated_at=? WHERE id=?",
                    (ft, row_count, data_json, json.dumps(match_info, ensure_ascii=False), datetime.now().isoformat(), row["id"]),
                )
                done += 1

    return {"status": "ok", "done": done, "failed": failed}


# ── 同步 ────────────────────────────────────────

@router.post("/sync")
async def vault_sync():
    async with db_session() as db:
        rows = await db.execute(
            "SELECT filename, parsed_data FROM uploads WHERE status='done' AND parsed_data IS NOT NULL ORDER BY updated_at ASC"
        )
        records = [dict(r) for r in await rows.fetchall()]

    if not records:
        return {"status": "empty"}

    merged = {}
    for r in records:
        try:
            merged.update(json.loads(r["parsed_data"]))
        except json.JSONDecodeError:
            continue

    async with db_session() as db:
        for key, val in merged.items():
            await db.execute(
                "INSERT OR REPLACE INTO dashboard_data (data_key, data_json, source_file, updated_at) VALUES (?, ?, ?, ?)",
                (key, json.dumps(val, ensure_ascii=False), "merged", datetime.now().isoformat()),
            )

    return {"status": "ok", "keys": len(merged), "data": merged}


# ── 单文件同步 ──────────────────────────────────

@router.post("/sync/{record_id}")
async def vault_sync_one(record_id: int):
    """同步单个文件的解析数据"""
    async with db_session() as db:
        row = await db.execute(
            "SELECT filename, parsed_data FROM uploads WHERE id=? AND status='done' AND parsed_data IS NOT NULL",
            (record_id,),
        )
        r = await row.fetchone()
    if not r:
        return {"status": "not_found"}

    try:
        data = json.loads(r["parsed_data"])
    except json.JSONDecodeError:
        return {"status": "error", "message": "数据损坏"}

    return {"status": "ok", "filename": r["filename"], "keys": len(data), "data": data}


# ── 记录管理 ────────────────────────────────────

@router.get("/history")
async def vault_history():
    async with db_session() as db:
        rows = await db.execute("SELECT * FROM uploads ORDER BY created_at DESC LIMIT 50")
        history = [dict(r) for r in await rows.fetchall()]
    return {"history": history}


@router.delete("/record/{record_id}")
async def vault_delete(record_id: int):
    async with db_session() as db:
        row = await db.execute("SELECT filename FROM uploads WHERE id=?", (record_id,))
        r = await row.fetchone()
        if r:
            (VAULT_DIR / r["filename"]).unlink(missing_ok=True)
        await db.execute("DELETE FROM uploads WHERE id=?", (record_id,))
    return {"status": "ok"}
