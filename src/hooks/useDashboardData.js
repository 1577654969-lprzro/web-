import { useMemo } from "react";
import { useDashboardStore } from "../store/dashboardStore";
import { safeNum, safeArr, safeObj, sum, pct } from "../lib/normalizeData";

/**
 * 统一的 Dashboard 数据 Hook
 * 页面只需调用此 hook，获取已处理的数据
 */
export function useDashboardData() {
  const data = useDashboardStore((s) => s.data);

  return useMemo(() => ({
    overview: safeObj(data?.overviewData),
    expenses: safeArr(data?.expenseBreakdown),
    departments: safeArr(data?.departmentData),
    bizCustomers: safeArr(data?.bizCustomerTop10),
    bizProducts: safeArr(data?.bizProductTop10),
    onlineSales: safeArr(data?.onlineSalesData),
    ar: safeObj(data?.arData),
    ap: safeObj(data?.apData),
    arByPerson: safeArr(data?.arByPerson),
    invProduct: safeObj(data?.inventoryProduct),
    invSupplier: safeObj(data?.inventorySupplier),
    freight: safeObj(data?.freightOverview),
    freightChannels: safeArr(data?.freightByChannel),
    raw: data,
  }), [data]);
}

/** 工具函数直接 re-export */
export { safeNum, safeArr, safeObj, sum, pct };
