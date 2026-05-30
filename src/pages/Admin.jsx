import { useState, useEffect, useRef, useCallback, startTransition } from "react";
import { useDashboardStore } from "../store/dashboardStore";
import { VAULT_API } from "../config/api";
import { syncDashboardData } from "../services/syncService";

export default function Admin() {
  const [history, setHistory] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmData, setConfirmData] = useState(null); // { file, match_info }
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
      await fetch(`${VAULT_API}/process`, { method: "POST" });
      await loadHistory();
      const r = await fetch(`${VAULT_API}/history`);
      const j = await r.json();
      const done = (j.history || []).find(h => h.status === "done");
      if (done) {
        let preview = null;
        try {
          const pr = await fetch(`${VAULT_API}/sync/${done.id}`, { method: "POST" });
          const pj = await pr.json();
          if (pj.status === "ok" && pj.data) preview = pj.data;
        } catch {}
        const mi = done.match_info ? (() => { try { return JSON.parse(done.match_info); } catch { return null; } })() : null;
        setConfirmData({
          file: done.filename,
          match: mi || { matched: 0, unmatched: 0, total_cols: 0, unmatched_cols: [] },
          id: done.id,
          preview,
        });
      } else {
        setMsg("解析完成，无有效数据");
      }
    } catch { setMsg("解析失败"); }
    setProcessing(false);
  };

  const handleConfirmSync = async () => {
    setConfirmData(null);
    setMsg("正在同步...");
    await handleSync();
  };

  const handleSync = async () => {
    setSyncing(true);
    const result = await syncDashboardData();
    if (result.ok) {
      startTransition(() => batchUpdate(result.data));
      setDataSource({ filename: `数据中心 (${result.keys}类)`, uploadedAt: Date.now() });
      setToast(`已同步 ${result.keys} 类数据到看板`, "success");
    } else {
      setMsg(result.message || "同步失败");
    }
    setSyncing(false);
  };

  const handleSyncOne = async (id, filename) => {
    try {
      const r = await fetch(`${VAULT_API}/sync/${id}`, { method: "POST" });
      const j = await r.json();
      if (j.status === "ok" && j.data) {
        startTransition(() => batchUpdate(j.data));
        setToast(`已同步 ${filename} (${j.keys} 类)`, "success");
      }
    } catch { setMsg("同步失败"); }
  };

  const handleRollback = async (id, filename) => {
    if (!window.confirm(`确定要回滚到版本 [${filename}] 吗？当前看板数据将被替换。`)) return;
    try {
      const r = await fetch(`${VAULT_API}/rollback/${id}`, { method: "POST" });
      const j = await r.json();
      if (j.status === "ok") {
        // 回滚成功后重新同步前端 Store
        const syncRes = await syncDashboardData();
        if (syncRes.ok) {
          startTransition(() => batchUpdate(syncRes.data));
          setToast(`已成功回滚至: ${filename}`, "success");
        }
      } else {
        setToast(j.message || "回滚失败", "error");
      }
    } catch { setToast("回滚请求失败", "error"); }
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

      {/* 确认弹窗 */}
      {confirmData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="crd p-6 w-[520px] max-h-[80vh] overflow-y-auto shadow-2xl">
            <h3 className="text-base font-bold text-text-primary mb-2">确认列名匹配</h3>
            <p className="text-xs text-text-muted mb-4">
              文件: {confirmData.file} — 请确认以下列名解析结果无误后同步
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-positive font-bold">{confirmData.match.matched}</span>
                <span className="text-text-muted">列匹配成功 /</span>
                <span className="text-text-primary font-bold">{confirmData.match.total_cols}</span>
                <span className="text-text-muted">总列数</span>
              </div>
              {confirmData.match.unmatched > 0 && (
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-xs text-warning font-medium mb-1">
                    {confirmData.match.unmatched} 列未匹配
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(confirmData.match.unmatched_cols || []).map(c => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-warning/20 text-warning">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 数据预览 */}
            {confirmData.preview && (() => {
              const p = confirmData.preview;
              const ov = p.overviewData?.budgetVsActual;
              const depts = p.departmentData || [];
              const exp = p.expenseBreakdown || [];
              const hasData = ov?.revenue?.actual > 0;
              return (
                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                  <p className="text-xs font-semibold text-text-primary">
                    数据预览 {hasData ? "" : <span className="text-warning">(解析异常)</span>}
                  </p>
                  {hasData ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-text-muted">收入</span>
                      <span className="text-positive font-mono font-bold">{(ov.revenue.actual / 10000).toFixed(0)} 万元</span>
                      <span className="text-text-muted">毛利</span>
                      <span className="text-positive font-mono font-bold">{(ov.grossProfit?.actual / 10000).toFixed(0)} 万元</span>
                      <span className="text-text-muted">部门</span>
                      <span className="text-text-primary font-mono">{depts.length} 个</span>
                      <span className="text-text-muted">费用</span>
                      <span className="text-text-primary font-mono">{exp.length} 项</span>
                    </div>
                  ) : (
                    <p className="text-xs text-warning font-medium">
                      Excel 格式不匹配，无法提取有效数据。请检查文件格式后重新上传。
                    </p>
                  )}
                  <p className="text-[10px] text-text-muted italic border-t border-white/5 pt-2">
                    仅提取到数据: {hasData ? "收入/毛利/部门/费用" : "无"}。
                    {hasData ? "其余字段(应收/应付/库存/运费等)当前留空，不会显示假数据。" : ""}
                  </p>
                </div>
              );
            })()}

            <div className="flex gap-2">
              <button onClick={handleConfirmSync}
                className="flex-1 py-2.5 rounded-lg bg-positive text-white text-sm font-bold hover:opacity-90">
                确认并同步到看板
              </button>
              <button onClick={() => setConfirmData(null)}
                className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-text-secondary text-sm hover:bg-white/10">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* 左栏：上传区 */}
        <div className="w-[340px] shrink-0 space-y-4">
          <div className="crd p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">上传文件</h3>
            <div className="space-y-2">
              <button onClick={() => fileRef.current?.click()}
                className="w-full py-2.5 rounded-lg bg-accent/20 border border-accent/30 text-accent text-sm font-medium hover:bg-accent/30 transition-all">
                选择文件 (.xlsx/.xls)
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
                    {r.status === "done" && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleSyncOne(r.id, r.filename)}
                          className="text-accent hover:text-accent-hover text-xs shrink-0 font-medium">同步</button>
                        <button onClick={() => handleRollback(r.id, r.filename)}
                          className="text-positive hover:text-positive/80 text-xs shrink-0 font-medium"
                          title="全量覆盖当前看板">回滚</button>
                      </div>
                    )}
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
