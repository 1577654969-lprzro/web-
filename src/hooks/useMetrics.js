import { useMemo } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { ensureArray, ensureObject } from '../store/selectors';

/**
 * 统一业务计算引擎 (Metrics Engine)
 * 
 * 作用：
 * 1. 统一全站 KPI 计算口径。
 * 2. 集中处理空值保护逻辑。
 * 3. 减少页面组件内的重复计算。
 */
export function useMetrics() {
  const data = useDashboardStore((state) => state.data);

  // 1. 经营概览核心指标
  const overviewMetrics = useMemo(() => {
    const overview = ensureObject(data?.overviewData);
    const { budgetVsActual = {}, yoy = {}, cumulative = {} } = overview;
    
    const revenueActual = budgetVsActual.revenue?.actual || 0;
    const grossProfitActual = budgetVsActual.grossProfit?.actual || 0;
    
    // 计算毛利率
    const grossMargin = revenueActual > 0 ? (grossProfitActual / revenueActual * 100) : 0;
    
    return {
      revenueActual,
      grossProfitActual,
      grossMargin,
      revenueBudgetRate: budgetVsActual.revenue?.rate || 0,
      revenueYoyRate: yoy?.revenue?.rate || 0,
      expenseActual: budgetVsActual.expense?.actual || 0,
      expenseBudgetRate: budgetVsActual.expense?.rate || 0,
      cumulativeRevenueRate: cumulative?.revenue?.rate || 0,
      cumulativeExpenseRate: cumulative?.expense?.rate || 0,
      raw: { budgetVsActual, yoy, cumulative }
    };
  }, [data?.overviewData]);

  // 2. 应收应付指标
  const arApMetrics = useMemo(() => {
    const arData = ensureObject(data?.arData);
    const apData = ensureObject(data?.apData);
    const arDepts = ensureArray(arData.arByDept);
    
    const totalAR = arData.totalAR || 0;
    const totalAP = apData.totalAP || 0;
    
    // 计算逾期 (180-360天 + 360天以上)
    const overdueAR = arDepts.reduce((s, d) => s + (d.ar180360 || 0) + (d.ar360p || 0), 0);
    const overdueRate = totalAR > 0 ? (overdueAR / totalAR * 100) : 0;
    
    return {
      totalAR,
      totalAP,
      overdueAR,
      overdueRate,
      top10ARShare: ensureArray(arData.top10Customers).reduce((s, d) => s + (d.share || 0), 0)
    };
  }, [data?.arData, data?.apData]);

  // 3. 库存指标
  const inventoryMetrics = useMemo(() => {
    const invProduct = ensureObject(data?.inventoryProduct);
    const invSupplier = ensureObject(data?.inventorySupplier);
    const remainingStock = ensureArray(invProduct.remainingStock);
    
    const totalProductStock = remainingStock.reduce((s, x) => s + (x.amount || 0), 0);
    
    // 计算超龄库存 (库龄 > 360天)
    const over360Stock = remainingStock.find(s => s.bucket?.includes("360"))?.amount || 0;
    const over360Rate = totalProductStock > 0 ? (over360Stock / totalProductStock * 100) : 0;

    return {
      totalProductStock,
      totalSupplierStock: invSupplier.totalStock || 0,
      over360Stock,
      over360Rate,
      supplierConcentration: invSupplier.supplierConcentration || 0
    };
  }, [data?.inventoryProduct, data?.inventorySupplier]);

  // 4. 运费指标
  const freightMetrics = useMemo(() => {
    const overview = ensureObject(data?.freightOverview);
    return {
      totalFreight: overview.totalFreight || 0,
      totalTickets: overview.totalTickets || 0,
      feeRatio: overview.feeRatio || 0,
      avgPerTicket: overview.avgPerTicket || 0
    };
  }, [data?.freightOverview]);

  return {
    overview: overviewMetrics,
    arAp: arApMetrics,
    inventory: inventoryMetrics,
    freight: freightMetrics,
    allData: data
  };
}
