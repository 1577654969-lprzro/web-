import { useDashboardStore } from "../../store/dashboardStore";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { APP_VERSION } from "../../config/api";

export default function StatusBar() {
  const { dataSource, toast, clearToast, data } = useDashboardStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";

  useEffect(() => {
    if (toast) {
      const t = setTimeout(clearToast, 4000);
      return () => clearTimeout(t);
    }
  }, [toast, clearToast]);

  const isMock = dataSource === "mock";
  const rowCount = Object.values(data).filter(v => Array.isArray(v)).reduce((s, a) => s + a.length, 0);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-[10px] bg-positive text-white text-sm font-medium shadow-lg animate-[slideDown_0.3s_ease-out]">
          {toast.message}
        </div>
      )}

      {/* Status bar */}
      <div className="h-[36px] bg-bg-sidebar border-b border-border flex items-center justify-between px-6 text-[11px] shrink-0 relative z-50">
        <div className="flex items-center gap-4 text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isMock ? "bg-warning" : "bg-positive"} animate-pulse`} />
            {isMock ? "演示数据" : (typeof dataSource === "object" ? dataSource.filename : "已加载")}
          </span>
          <span>{rowCount} 条记录</span>
          {!isMock && typeof dataSource === "object" && (
            <span>更新于 {new Date(dataSource.uploadedAt).toLocaleTimeString("zh-CN")}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* 这里可以放一些全局状态图标，或者留空让右侧插件处理导航 */}
          <span className="text-text-muted text-[10px]">v{APP_VERSION}</span>
        </div>
      </div>

      <style>{`@keyframes slideDown{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </>
  );
}
