import { createContext, useContext, useState, useCallback, useEffect } from "react";

const Ctx = createContext(null);

export function AnalysisProvider({ children }) {
  const [isOpen, setOpen] = useState(false);
  const [pageData, setPageData] = useState({});
  const [pageName, setPageName] = useState("经营概览");

  const configure = useCallback((name, data) => {
    setPageName(name);
    setPageData(data);
  }, []);

  return (
    <Ctx.Provider value={{ isOpen, setOpen, pageData, pageName, configure }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAnalysis(name, data) {
  const ctx = useContext(Ctx);

  useEffect(() => {
    if (ctx && name) {
      const prev = ctx.pageName;
      if (prev !== name || JSON.stringify(ctx.pageData) !== JSON.stringify(data)) {
        ctx.configure(name, data);
      }
    }
  }, [ctx, name, data]);

  return ctx;
}
