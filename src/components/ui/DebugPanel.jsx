import { useState } from "react";
import { useDashboardStore } from "../../store/dashboardStore";

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const { diagnostics, data, dataSource } = useDashboardStore();

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-[60] w-10 h-10 rounded-full bg-black/80 border border-white/20 text-white flex items-center justify-center shadow-2xl hover:bg-accent transition-all"
        title="打开调试面板"
      >
        <span className="text-xs font-bold">BUG</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[60] w-[400px] h-[500px] bg-bg-sidebar/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div>
          <h3 className="text-sm font-bold text-text-primary">数据健康报告</h3>
          <p className="text-[10px] text-text-muted mt-0.5">
            数据源: {typeof dataSource === 'string' ? dataSource : dataSource?.filename}
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-text-muted hover:text-text-primary text-xs"
        >
          隐藏
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
        {/* 诊断信息 */}
        <section>
          <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3">诊断结果</h4>
          {diagnostics ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-text-secondary mb-2 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${diagnostics.missingModules.length > 0 ? 'bg-warning' : 'bg-positive'}`} />
                  缺失模块 ({diagnostics.missingModules.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {diagnostics.missingModules.length > 0 ? (
                    diagnostics.missingModules.map(m => (
                      <span key={m} className="text-[9px] px-2 py-1 rounded bg-warning/10 text-warning border border-warning/20">{m}</span>
                    ))
                  ) : (
                    <span className="text-[9px] text-text-muted italic">无缺失模块</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-muted italic">尚未进行数据校验</p>
          )}
        </section>

        {/* 实时数据预览 */}
        <section>
          <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3">Schema 实时数据</h4>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px] text-text-secondary overflow-x-auto whitespace-pre">
            {JSON.stringify(data, (key, value) => {
              if (Array.isArray(value)) return `Array(${value.length})`;
              return value;
            }, 2)}
          </div>
        </section>
      </div>

      <div className="px-5 py-3 border-t border-white/5 bg-black/20 text-[9px] text-text-muted text-center italic">
        企业级 BI 数据中台 · 调试模式
      </div>
    </div>
  );
}
