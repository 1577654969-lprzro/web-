/**
 * 数据选择器 (Selectors) — 生产级实现
 * 
 * 作用：
 * 1. 解耦：将原始 Store 结构与 UI 组件所需的格式分离。
 * 2. 健壮性：提供默认值，防止因数据缺失导致的渲染崩溃。
 * 3. 性能：集中处理昂贵的计算逻辑。
 */

// 1. 经营概览选择器
export const selectBudgetChartData = (storeData) => {
  const overview = ensureObject(storeData?.overviewData);
  const { budgetVsActual } = overview;
  if (!budgetVsActual) return [];
  
  return [
    { name: "收入", 实际: budgetVsActual.revenue?.actual || 0, 预算: budgetVsActual.revenue?.budget || 0 },
    { name: "毛利", 实际: budgetVsActual.grossProfit?.actual || 0, 预算: budgetVsActual.grossProfit?.budget || 0 },
    { name: "费用", 实际: budgetVsActual.expense?.actual || 0, 预算: budgetVsActual.expense?.budget || 0 },
  ];
};

// 2. 库存库龄选择器
export const selectInventoryAgingData = (storeData) => {
  const inventory = ensureObject(storeData?.inventoryProduct);
  const { remainingStock } = inventory;
  if (!remainingStock || !Array.isArray(remainingStock)) return [];
  
  return remainingStock
    .filter(d => d.bucket)
    .map(d => ({ 
      name: d.bucket, 
      金额: d.amount || 0,
      占比: d.share || 0 
    }));
};

// 3. 应收账龄选择器
export const selectARAgingData = (storeData) => {
  const arData = ensureObject(storeData?.arData);
  const { arByDept } = arData;
  if (!arByDept || !Array.isArray(arByDept)) return [];
  
  return [
    { name: "30天内", 金额: arByDept.reduce((s, d) => s + (d.ar30 || 0), 0) },
    { name: "30-60天", 金额: arByDept.reduce((s, d) => s + (d.ar3060 || 0), 0) },
    { name: "60-180天", 金额: arByDept.reduce((s, d) => s + (d.ar60180 || 0), 0) },
    { name: "180-360天", 金额: arByDept.reduce((s, d) => s + (d.ar180360 || 0), 0) },
    { name: "360天以上", 金额: arByDept.reduce((s, d) => s + (d.ar360p || 0), 0) },
  ];
};

// 4. 运费对比选择器
export const selectFreightChartData = (storeData) => {
  const freightByChannel = ensureArray(storeData?.freightByChannel);
  
  return freightByChannel
    .filter(c => (c.freight || 0) > 0)
    .map(c => ({ 
      name: c.channel, 
      运费: c.freight || 0 
    }));
};

// 5. 统一数据校验辅助 (Safe Selectors)
export const ensureArray = (data) => Array.isArray(data) ? data : [];
export const ensureObject = (data) => (data && typeof data === 'object') ? data : {};
