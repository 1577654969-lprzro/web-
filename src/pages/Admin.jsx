import { useState, useEffect, useRef, useCallback } from "react";
import { useDashboardStore } from "../store/dashboardStore";
import { VAULT_API } from "../config/api";

export default function Admin() {
  const [history, setHistory] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const folderRef = useRef(null);
  const batchUpdate = useDashboardStore((s) => s.batchUpdate);
  const setToast = useDashboardStore((s) => s.setToast);
  const setDataSource = useDashboardStore((s) => s.setDataSource);

  const loadHistory = useCallback(async () => {
    try {
      const r = await fetch(`${VAULT_API}/history`);
      const j = await r.json();
      setHistory(j.history || []);
    } catch { /* offline */ }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const uploadFiles = async (files) => {
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    try {
      const r = await fetch(`${VAULT_API}/upload-folder`, { method: "POST", body: fd });
      const j = await r.json();
      setMsg(`已上传 ${j.count} 个文件`);
      loadHistory();
    } catch { setMsg("上传失败：后端未连接"); }
  };

  const handleProcess = async () => {
    setProcessing(true);
    setMsg("正在解析...");
    try {
      const r = await fetch(`${VAULT_API}/process`, { method: "POST" });
      const j = await r.json();
      setMsg(`解析完成：${j.done} 成功，${j.failed} 失败`);
      loadHistory();
    } catch { setMsg("解析失败"); }
    setProcessing(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const r = await fetch(`${VAULT_API}/sync`, { method: "POST" });
      const j = await r.json();
      if (j.status === "ok" && j.data) {
        batchUpdate(j.data);
        setDataSource({ filename: `数据中心 (${j.keys}类)`, uploadedAt: Date.now() });
        setToast(`已同步 ${j.keys} 类数据到看板`, "success");
      }
    } catch { setMsg("同步失败"); }
    setSyncing(false);
  };

  const handleDelete = async (id) => {
    await fetch(`${VAULT_API}/record/${id}`, { method: "DELETE" });
    loadHistory();
  };

  const queued = history.filter((r) => r.status === "queued").length;
  const done = history.filter((r) => r.status === "done").length;

  return (
    <div className="space-y-6">
      <h2 className="section-title">数据中心</h2>
      <p className="text-sm text-text-muted">上传 Excel/PPTX/DOCX → 解析入库 → 同步到看板</p>

      {msg && <div className="px-4 py-3 rounded-[10px] bg-accent/10 text-accent text-sm">{msg}</div>}

      <div className="flex gap-6">
        {/* 左栏：上传区 */}
        <div className="w-[340px] shrink-0 space-y-4">
          <div className="crd p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">上传文件</h3>
            <div className="space-y-2">
              <button onClick={() => fileRef.current?.click()}
                className="w-full py-2.5 rounded-lg bg-accent/20 border border-accent/30 text-accent text-sm font-medium hover:bg-accent/30 transition-all">
                选择文件 (.xlsx/.pptx/.docx)
              </button>
              <button onClick={() => folderRef.current?.click()}
                className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-text-secondary text-sm hover:bg-white/10 transition-all">
                选择整个文件夹
              </button>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.pptx,.docx" multiple className="hidden"
                onChange={(e) => e.target.files.length && uploadFiles(Array.from(e.target.files))} />
              <input ref={folderRef} type="file" /* @ts-ignore */ webkitdirectory="" directory="" multiple className="hidden"
                onChange={(e) => e.target.files.length && uploadFiles(Array.from(e.target.files))} />
            </div>
          </div>

          <div className="crd p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">操作</h3>
            <div className="space-y-2">
              <button onClick={handleProcess} disabled={processing || queued === 0}
                className="w-full py-3 rounded-lg bg-warning/20 border border-warning/30 text-warning text-sm font-bold hover:bg-warning/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                {processing ? "解析中..." : `解析全部 (${queued} 待处理)`}
              </button>
              <button onClick={handleSync} disabled={syncing || done === 0}
                className="w-full py-3 rounded-lg bg-positive/20 border border-positive/30 text-positive text-sm font-bold hover:bg-positive/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                {syncing ? "同步中..." : `同步到看板 (${done} 可用)`}
              </button>
            </div>
          </div>
        </div>

        {/* 右栏：上传记录 */}
        <div className="flex-1 min-w-0">
          <div className="crd p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">上传记录</h3>
            {history.length === 0 ? (
              <p className="text-sm text-text-muted py-12 text-center">暂无记录，请上传文件</p>
            ) : (
              <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                {history.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-white/5 border border-white/5 text-sm">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      r.status === "done" ? "bg-positive" :
                      r.status === "processing" ? "bg-accent animate-pulse" :
                      r.status === "error" ? "bg-negative" : "bg-warning"
                    }`} />
                    <span className="flex-1 truncate text-text-secondary">{r.filename}</span>
                    <span className="text-text-muted text-xs shrink-0">{r.size_kb}KB</span>
                    {r.status === "done" && <span className="text-positive text-xs shrink-0">{r.row_count}行</span>}
                    {r.status === "error" && <span className="text-negative text-xs shrink-0">{r.error}</span>}
                    {r.status === "queued" && <span className="text-warning text-xs shrink-0">待处理</span>}
                    <button onClick={() => handleDelete(r.id)}
                      className="text-text-muted hover:text-negative text-xs shrink-0">删除</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
