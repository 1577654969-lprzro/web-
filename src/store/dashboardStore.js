import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getInitialData, loadFromServer } from "../services/dataLoader";
import { createSyncChannel } from "./sync";
import { normalizeDashboardData } from "../utils/normalizer";

const syncChannel = createSyncChannel((message) => {
  if (message.type === "SYNC_DATA") {
    // Force a state update to trigger re-renders across all components
    useDashboardStore.setState({ 
      data: message.payload,
      lastUpdated: message.lastUpdated || {},
      diagnostics: message.diagnostics || null
    });
  }
});

export const useDashboardStore = create()(
  persist(
    (set, get) => ({
      data: getInitialData(),
      diagnostics: null, // { missingModules, fieldErrors, timestamp }
      lastUpdated: {}, // { path: timestamp }
      toast: null, // { message, type: 'success'|'info' }
      dataSource: "mock", // "mock" | { filename, uploadedAt }
      setToast: (msg, type = "success") => set({ toast: { message: msg, type } }),
      clearToast: () => set({ toast: null }),
      setDataSource: (info) => set({ dataSource: info }),

      // Update a specific data key
      updateData: (key, newData) => {
        set((state) => {
          // 在更新前进行标准化
          const { data: normalizedData, diagnostics } = normalizeDashboardData({
            ...state.data,
            [key]: newData
          });

          const updatedData = normalizedData;
          
          // Determine which page path this key belongs to
          const pathMap = {
            overviewData: "/",
            expenseBreakdown: "/",
            departmentData: "/sales",
            bizCustomerTop10: "/sales",
            bizProductTop10: "/sales",
            onlineSalesData: "/sales",
            arData: "/ar-ap",
            apData: "/ar-ap",
            arByPerson: "/ar-ap",
            inventoryProduct: "/inventory",
            inventorySupplier: "/inventory",
            freightOverview: "/freight",
            freightByChannel: "/freight",
          };

          const targetPath = pathMap[key];
          const nextLastUpdated = { ...state.lastUpdated };
          if (targetPath) {
            nextLastUpdated[targetPath] = Date.now();
          }

          // Broadcast to other tabs
          syncChannel?.postMessage({
            type: "SYNC_DATA",
            payload: updatedData,
            lastUpdated: nextLastUpdated,
            diagnostics
          });

          return { data: updatedData, lastUpdated: nextLastUpdated, diagnostics };
        });
      },

      // Batch update with safe merge — keeps old values for keys not in updates
      batchUpdate: (updates) => {
        if (!updates || typeof updates !== "object" || Object.keys(updates).length === 0) return;
        set((state) => {
          // 合并原始数据和更新数据
          const mergedRaw = { ...state.data, ...updates };
          // 执行标准化
          const { data: normalizedData, diagnostics } = normalizeDashboardData(mergedRaw);

          const updatedData = normalizedData;

          const pathMap = {
            overviewData: "/",
            expenseBreakdown: "/",
            departmentData: "/sales",
            bizCustomerTop10: "/sales",
            bizProductTop10: "/sales",
            onlineSalesData: "/sales",
            arData: "/ar-ap",
            apData: "/ar-ap",
            arByPerson: "/ar-ap",
            inventoryProduct: "/inventory",
            inventorySupplier: "/inventory",
            freightOverview: "/freight",
            freightByChannel: "/freight",
          };

          const nextLastUpdated = { ...state.lastUpdated };
          Object.keys(updates).forEach(key => {
            const targetPath = pathMap[key];
            if (targetPath) {
              nextLastUpdated[targetPath] = Date.now();
            }
          });

          // Broadcast to other tabs
          syncChannel?.postMessage({
            type: "SYNC_DATA",
            payload: updatedData,
            lastUpdated: nextLastUpdated,
            diagnostics
          });

          return { data: updatedData, lastUpdated: nextLastUpdated, diagnostics };
        });
      },

      clearUpdateHint: (path) => {
        set((state) => ({
          lastUpdated: { ...state.lastUpdated, [path]: null }
        }));
      },

      fetchFromServer: async () => {
        const data = await loadFromServer();
        if (data) set({ data });
      },

      resetData: () => {
        const resetState = getInitialData();
        set({ data: resetState });
        syncChannel?.postMessage({ type: "SYNC_DATA", payload: resetState });
      },
    }),
    {
      name: "bl-dashboard-storage",
      version: 1,
      partialize: (state) => ({ data: state.data }),
      // Debounce localStorage 写入 500ms，避免连续更新时卡顿
      storage: {
        getItem: (name) => {
          try { return localStorage.getItem(name); } catch { return null; }
        },
        setItem: (name, value) => {
          // 用 requestIdleCallback 延迟写入，不阻塞渲染
          const write = () => { try { localStorage.setItem(name, value); } catch {} };
          if (typeof requestIdleCallback !== "undefined") {
            requestIdleCallback(write, { timeout: 1000 });
          } else {
            setTimeout(write, 500);
          }
        },
        removeItem: (name) => {
          try { localStorage.removeItem(name); } catch {}
        },
      },
    }
  )
);
