import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import StatusBar from "./StatusBar";
import ErrorBoundary from "../ui/ErrorBoundary";
import { AnalysisProvider, useAnalysis } from "../analysis/AnalysisContext";
import SideDock from "../analysis/SideDock";
import ToolboxPanel from "../analysis/ToolboxPanel";
import DebugPanel from "../ui/DebugPanel";
import { useDashboardStore } from "../../store/dashboardStore";
import { useEffect, useRef } from "react";

function LayoutInner() {
  const { isOpen, setOpen, pageData, pageName } = useAnalysis();
  const fetchFromServer = useDashboardStore((state) => state.fetchFromServer);
  const didFetch = useRef(false);

  useEffect(() => {
    if (!didFetch.current) {
      didFetch.current = true;
      fetchFromServer();
    }
  }, [fetchFromServer]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary flex-col">
      <StatusBar />
      <div className="flex flex-1 overflow-hidden pr-[52px]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-10">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <SideDock />

      <DebugPanel />

      {isOpen && (
        <ToolboxPanel
          pageData={pageData}
          pageName={pageName}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export default function Layout() {
  return (
    <AnalysisProvider>
      <LayoutInner />
    </AnalysisProvider>
  );
}
