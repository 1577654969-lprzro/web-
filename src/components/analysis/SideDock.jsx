import { useState } from "react";
import { useAnalysis } from "./AnalysisContext";
import { useDashboardStore } from "../../store/dashboardStore";
import { syncDashboardData } from "../../services/syncService";

export default function SideDock() {
  const { isOpen, setOpen } = useAnalysis();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const batchUpdate = useDashboardStore((s) => s.batchUpdate);
  const setToast = useDashboardStore((s) => s.setToast);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg("");
    const result = await syncDashboardData();
    if (result.ok) {
      batchUpdate(result.data);
      setToast(`已同步 ${result.keys} 类数据`, "success");
      setSyncMsg(`已同步 ${result.keys} 类`);
      if (result.warning) setSyncMsg(result.warning);
    } else {
      setSyncMsg(result.message || "同步失败");
    }
  };

  return (
    <div className="fixed right-0 top-[36px] bottom-0 z-40 flex">
      <div className="w-[52px] bg-bg-sidebar/80 backdrop-blur-md border-l border-white/5 flex flex-col items-center py-6 gap-6 shadow-2xl">
        {/* 工具箱 */}
        <button
          onClick={() => setOpen(!isOpen)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isOpen ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-muted hover:bg-white/5 hover:text-text-primary"
          }`}
          title="智能分析"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </button>

        {/* 同步按钮 */}
        <div className="relative group">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-positive hover:bg-positive/10 transition-all disabled:opacity-30"
            title="同步数据到看板"
          >
            <svg className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {syncMsg && (
            <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-bg-card border border-border px-2 py-1 rounded-md text-[10px] text-positive whitespace-nowrap shadow-lg">
              {syncMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
