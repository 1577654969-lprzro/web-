import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AnalysisMessage from "./AnalysisMessage";
import { analyze, quickQuestions } from "../../lib/analysisEngine";
import { useDashboardStore } from "../../store/dashboardStore";

export default function ToolboxPanel({ pageData, pageName, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";
  const resetData = useDashboardStore((state) => state.resetData);
  const setToast = useDashboardStore((state) => state.setToast);

  const [activeTab, setActiveTab] = useState("analysis"); // 'analysis' | 'data'

  const handleReset = () => {
    if (window.confirm("确定要重置所有数据为演示数据吗？当前上传的数据将会被覆盖。")) {
      resetData();
      setToast("已重置为演示数据", "info");
    }
  };

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `你好，我是经营数据分析助手。当前查看的是「${pageName}」模块，我可以帮你分析数据、发现问题、给出建议。试试下面的快捷问题？`,
    },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (text) => {
    const question = text.trim();
    if (!question) return;
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");

    const result = analyze(pageData, question);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "分析完成：", result },
      ]);
    }, 400);
  };

  return (
    <div className="fixed top-[36px] bottom-0 right-0 w-[380px] bg-bg-sidebar/98 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] animate-[slideIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
      {/* Header with Tabs */}
      <div className="px-5 pt-5 pb-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-text-primary tracking-tight">智能助手</h3>
            <p className="text-[11px] text-text-muted mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              当前：{pageName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white/5 border border-white/10 text-text-muted hover:text-warning hover:bg-warning/10 hover:border-warning/30 transition-all"
              title="重置为演示数据"
            >
              重置
            </button>
            <button 
              onClick={() => navigate(isAdmin ? "/" : "/admin")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                isAdmin 
                  ? "bg-accent/10 border-accent/30 text-accent hover:bg-accent/20" 
                  : "bg-white/5 border-white/10 text-text-muted hover:text-text-primary hover:bg-white/10"
              }`}
            >
              {isAdmin ? "← 返回看板" : "数据中心 →"}
            </button>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-text-primary transition-all border border-white/5 hover:border-white/10"
            >
              ✕
            </button>
          </div>
        </div>

      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <AnalysisMessage key={i} {...msg} />
        ))}
      </div>

      {/* Footer: Quick questions & Input */}
      <div className="p-5 space-y-4 border-t border-white/5 bg-white/[0.01]">
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map((q) => (
            <button
              key={q.label}
              onClick={() => send(q.query)}
              className="text-[10px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-accent/30 hover:text-accent text-text-secondary transition-all"
            >
              {q.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="询问业务指标..."
            className="flex-1 bg-black/20 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none border border-white/5 focus:border-accent/30 transition-all shadow-inner"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            className="px-5 py-3 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent-hover transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-accent/20"
          >
            发送
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { 
          from { transform: translateX(100%); opacity: 0; } 
          to { transform: translateX(0); opacity: 1; } 
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
