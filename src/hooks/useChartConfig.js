/**
 * 配置驱动的图表 Hook
 * 页面传入 pageConfig，返回渲染所需的数据和配置
 */
export function useChartConfig(pageConfig, data) {
  if (!pageConfig) return { kpis: [], charts: [], tables: [] };

  const kpis = (pageConfig.kpiCards || []).map((kpi) => ({
    ...kpi,
    value: computeValue(kpi.source, data),
  }));

  return { kpis, charts: pageConfig.charts || [], tables: pageConfig.tables || [] };
}

function computeValue(source, data) {
  if (!source || !data) return 0;
  // source: "overview.budgetVsActual.revenue.actual" or "ar.totalAR"
  const parts = source.split(".");
  let val = data;
  for (const p of parts) {
    if (val == null) return 0;
    val = val[p];
  }
  return val ?? 0;
}
