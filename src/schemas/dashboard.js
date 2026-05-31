/**
 * 数据 Schema — 公司看板模式：不上传Excel则无数据
 * 禁止 mock 填充，未提取的字段显示"暂无数据"
 */
import { normalizeDashboardData } from "../utils/normalizer";

const EMPTY = {
  overviewData: {
    month: "",
    budgetVsActual: {
      revenue: { actual: 0, budget: 0, rate: 0 },
      grossProfit: { actual: 0, budget: 0, rate: 0 },
      expense: { actual: 0, budget: 0, rate: 0 },
    },
    yoy: { revenue: { actual: 0, yoy: 0, rate: 0 } },
    cumulative: { revenue: { actual: 0, budget: 0, rate: 0 } },
  },
  expenseBreakdown: [],
  departmentData: [],
  bizCustomerTop10: [],
  bizProductTop10: [],
  productCategoryData: {},
  keyCustomerData: { top10: [], strategy: { issue: "", action: "" } },
  onlineSalesData: [],
  arData: { totalAR: 0, arByDept: [], top10Customers: [] },
  apData: { totalAP: 0, agingDistribution: [], top10Suppliers: [] },
  arByPerson: [],
  inventoryProduct: { remainingStock: [], inStockAging: [], top10Products: [] },
  inventorySupplier: { totalStock: 0, remainingStock: [], top10Suppliers: [], supplierConcentration: 0 },
  freightOverview: { totalFreight: 0, lastMonthFreight: 0, totalTickets: 0, lastMonthTickets: 0, feeRatio: 0, lastMonthFeeRatio: 0 },
  freightByChannel: [],
};

export function getEmptyData() {
  return JSON.parse(JSON.stringify(EMPTY));
}

/**
 * 标准化 + 只覆盖有真实数据的字段
 */
export function withDefaults(data) {
  const { data: normalized } = normalizeDashboardData(data || {});
  const result = getEmptyData();
  const _has = {};

  Object.keys(normalized).forEach(key => {
    if (!(key in result)) return;
    const val = normalized[key];
    if (Array.isArray(val)) {
      if (val.length > 0) { result[key] = val; _has[key] = true; }
    } else if (val && typeof val === 'object') {
      const hasData = Object.values(val).some(v => {
        if (typeof v === 'number') return v > 0;
        if (Array.isArray(v)) return v.length > 0;
        return !!v;
      });
      if (hasData) { result[key] = val; _has[key] = true; }
    }
  });

  result._sourceMeta = { realKeys: Object.keys(_has), timestamp: Date.now() };
  return result;
}

export { validateSchema } from "../utils/normalizer";
