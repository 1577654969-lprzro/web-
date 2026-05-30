import { NavLink, useLocation } from "react-router-dom";
import { useDashboardStore } from "../../store/dashboardStore";
import { useEffect } from "react";

const navItems = [
  { path: "/", label: "经营概览" },
  { path: "/sales", label: "销售分析" },
  { path: "/ar-ap", label: "应收应付" },
  { path: "/inventory", label: "库存分析" },
  { path: "/freight", label: "运费分析" },
];

export default function Sidebar() {
  const location = useLocation();
  const { lastUpdated, clearUpdateHint } = useDashboardStore();

  // Clear hint when user visits the page
  useEffect(() => {
    if (lastUpdated[location.pathname]) {
      // Small delay to let the user see the dot before clearing
      const timer = setTimeout(() => {
        clearUpdateHint(location.pathname);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, lastUpdated, clearUpdateHint]);

  return (
    <aside className="w-64 bg-bg-sidebar min-h-screen flex flex-col border-r border-white/5 shrink-0">
      <div className="px-8 py-10">
        <h1 className="text-xl font-bold text-text-primary tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-white text-xs">ZY</span>
          </div>
          至远药业
        </h1>
        <p className="text-[10px] text-text-muted mt-2 font-bold uppercase tracking-widest">
          Business Data Dashboard
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const hasUpdate = !!lastUpdated[item.path];
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 text-[14px] rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-accent/10 text-accent font-bold shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                }`
              }
            >
              <span className="flex items-center gap-3">
                {item.label}
              </span>

              {hasUpdate && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-8 py-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-positive animate-pulse" />
          <p className="text-[11px] text-text-muted font-medium">数据更新：2026-05-22</p>
        </div>
      </div>
    </aside>
  );
}
