/**
 * 数据 Schema 与 默认值中心
 * 
 * 整合了 Mock Fallback 与 智能 Normalizer
 */
import { normalizeDashboardData } from "../utils/normalizer";
import * as mockData from "../data/mockData";

const MOCK_FALLBACK = {
  overviewData: mockData.overviewData,
  expenseBreakdown: mockData.expenseBreakdown,
  departmentData: mockData.departmentData,
  bizCustomerTop10: mockData.bizCustomerTop10,
  bizProductTop10: mockData.bizProductTop10,
  productCategoryData: mockData.productCategoryData,
  keyCustomerData: mockData.keyCustomerData,
  onlineSalesData: mockData.onlineSalesData,
  arData: mockData.arData,
  apData: mockData.apData,
  arByPerson: mockData.arByPerson,
  inventoryProduct: mockData.inventoryProduct,
  inventorySupplier: mockData.inventorySupplier,
  freightOverview: mockData.freightOverview,
  freightByChannel: mockData.freightByChannel,
};

/**
 * 核心导出：带默认值的标准化函数
 */
export function withDefaults(data) {
  // 1. 先进行智能映射和类型转换
  const { data: normalized, diagnostics } = normalizeDashboardData(data || {});
  
  // 2. 对于缺失或为空的模块，使用 Mock 数据兜底
  const result = { ...MOCK_FALLBACK };
  
  // 记录哪些字段有真实数据
  const _has = {};
  Object.keys(normalized).forEach(key => {
    const val = normalized[key];
    if (Array.isArray(val)) {
      if (val.length > 0) { result[key] = val; _has[key] = true; }
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      const hasRealData = Object.values(val).some(v => {
        if (typeof v === 'number') return v > 0;
        if (Array.isArray(v)) return v.length > 0;
        if (v && typeof v === 'object') return Object.keys(v).length > 0;
        return !!v;
      });
      if (hasRealData) { result[key] = val; _has[key] = true; }
    }
  });
  // 附加元数据：哪些键来自真实数据
  result._sourceMeta = { realKeys: Object.keys(_has), timestamp: Date.now() };

  return result;
}

export { validateSchema } from "../utils/normalizer"; // 可以从 normalizer 导出更详细的校验
