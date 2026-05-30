import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell,
} from "recharts";
import KPICard from "../components/ui/KPICard";
import DataTable from "../components/ui/DataTable";
import ChartCard, { CustomTooltip } from "../components/charts/ChartCard";
import { useAnalysis } from "../components/analysis/AnalysisContext";
import { useDashboardStore } from "../store/dashboardStore";
import { selectBudgetChartData, ensureArray, ensureObject } from "../store/selectors";
import { useMetrics } from "../hooks/useMetrics";
import { useMemo } from "react";

const COLORS = ["#38BDF8", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6", "#EC4899", "#06B6D4"];

export default function Overview() {
  const { overview, allData } = useMetrics();
  const { revenueActual, grossProfitActual, grossMargin, revenueBudgetRate, revenueYoyRate, raw } = overview;
  const { budgetVsActual, yoy, cumulative } = raw;

  const departmentData = useDashboardStore((state) => state.data.departmentData);
  const expenseBreakdown = useDashboardStore((state) => state.data.expenseBreakdown);

  const budgetData = useMemo(() => selectBudgetChartData(allData), [allData]);

  const budgetMargin = 3.23; // 预算毛利率目标
  const yoyGrossRate = yoy?.grossProfit?.rate || yoy?.revenue?.rate || 0;

  useAnalysis("经营概览", {
    grossMargin,
    budgetRate: revenueBudgetRate,
    actualRevenue: revenueActual,
    budgetRevenue: budgetVsActual.revenue?.budget || 0,
  });

  const safe = (v, fallback = 0) => v ?? fallback;

  const deptColumns = [
    { key: "dept", label: "部门", sortable: true },
    { key: "revenue202604", label: "本月收入(万元)", sortable: true, render: (v) => v.toLocaleString() },
    { key: "revenueChange", label: "环比变化", sortable: true, render: (v) => <span className={v >= 0 ? "text-positive" : "text-negative"}>{v >= 0 ? "+" : ""}{v.toFixed(2)}%</span> },
    { key: "grossProfitRate202604", label: "毛利率", sortable: true, render: (v) => `${v.toFixed(2)}%` },
    { key: "marginShare", label: "边际贡献率", sortable: true, render: (v) => `${v.toFixed(2)}%` },
  ];

  const expenseColumns = [
    { key: "category", label: "费用类别", sortable: true },
    { key: "amount202604", label: "2026年4月(万元)", sortable: true, render: (v) => v.toFixed(2) },
    { key: "amount202504", label: "2025年4月(万元)", sortable: true, render: (v) => v.toFixed(2) },
  ];

  return (
    <div className="space-y-8">
      <h2 className="section-title">经营概览 — 2026年4月</h2>
      <p className="text-sm text-text-muted mt-1">
        月度收入 {revenueActual.toLocaleString()} 万元，预算达成率 {revenueBudgetRate.toFixed(1)}%；
        毛利率 {grossMargin.toFixed(2)}%，同比 {revenueYoyRate > 100 ? "增长" : "下降"} {Math.abs(revenueYoyRate - 100).toFixed(2)} 个百分点
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="月度收入" value={revenueActual} unit="万元" change={revenueBudgetRate - 100} changeLabel="预算达成率" inverse />
        <KPICard label="月度毛利" value={grossProfitActual} unit="万元" change={(budgetVsActual?.grossProfit?.rate || 100) - 100} changeLabel="预算达成率" inverse />
        <KPICard label="毛利率" value={grossMargin} unit="%" change={grossMargin - budgetMargin} changeLabel={`vs预算 ${budgetMargin.toFixed(2)}%`} />
        <KPICard label="月度费用" value={overview.expenseActual} unit="万元" change={overview.expenseBudgetRate - 100} changeLabel="预算使用率" inverse />
      </div>

      {/* YoY KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="收入同比" value={revenueYoyRate} unit="%" change={revenueYoyRate - 100} changeLabel="同比增长" />
        <KPICard label="毛利率同比" value={yoyGrossRate || 0} unit="%" change={(yoyGrossRate || 0) - 2.76} changeLabel="vs 同期" />
        <KPICard label="累计收入" value={cumulative?.revenue?.budget || 0} unit="万元" change={overview.cumulativeRevenueRate - 100} changeLabel="季度达成率" inverse />
        <KPICard label="累计费用预算" value={cumulative?.expense?.budget || 0} unit="万元" change={overview.cumulativeExpenseRate - 100} changeLabel="已使用占比" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual Bar Chart */}
        <ChartCard title="预算 vs 实际对比" subtitle="单位：万元">
          <ResponsiveContainer width="100%" height={300}>
            {budgetData.length > 0 ? (
              <BarChart 
                key={`budget-chart-${budgetData.length}`}
                data={budgetData} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  dx={-10}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                />
                <Tooltip 
                  content={<CustomTooltip formatter={(v) => `${v.toLocaleString()} 万元`} />} 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  animationDuration={200}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '11px' }} />
                <Bar dataKey="实际" fill="#38BDF8" radius={[4, 4, 0, 0]} barSize={32} animationDuration={1000} />
                <Bar dataKey="预算" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} barSize={32} animationDuration={1000} />
              </BarChart>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-muted italic">暂无数据</div>
            )}
          </ResponsiveContainer>
        </ChartCard>

        {/* YoY Revenue/Gross Profit by department */}
        <div className="crd p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">分部门收入/毛利率</h3>
          <DataTable columns={deptColumns} rows={ensureArray(departmentData)} rowKey="dept" />
        </div>
      </div>

      {/* Expense breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="crd p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">费用结构对比 (本月 vs 同期)</h3>
          <DataTable columns={expenseColumns} rows={ensureArray(expenseBreakdown)} rowKey="category" />
        </div>

        <ChartCard title="费用结构分布 (本月)" subtitle="根据支出类型划分">
          <ResponsiveContainer width="100%" height={300}>
            {ensureArray(expenseBreakdown).length > 0 ? (
              <PieChart key={`expense-pie-${expenseBreakdown.length}`}>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="amount202604"
                  nameKey="category"
                  stroke="none"
                  animationDuration={1000}
                  animationBegin={0}
                >
                  {expenseBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomTooltip formatter={(v) => `${v.toFixed(2)} 万元`} />}
                  animationDuration={200}
                />
                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-muted italic">暂无数据</div>
            )}
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
