import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import DataTable from "../components/ui/DataTable";
import KPICard from "../components/ui/KPICard";
import ChartCard, { CustomTooltip } from "../components/charts/ChartCard";
import { useAnalysis } from "../components/analysis/AnalysisContext";
import { useDashboardStore } from "../store/dashboardStore";
import { selectARAgingData, ensureArray, ensureObject } from "../store/selectors";

export default function ReceivablePayable() {
  const { data } = useDashboardStore();
  const arData = ensureObject(data?.arData);
  const apData = ensureObject(data?.apData);
  const arByPerson = ensureArray(data?.arByPerson);
  const [showPersonDetail, setShowPersonDetail] = useState(false);

  const arAgingData = selectARAgingData(data);

  const apAgingData = ensureArray(apData.agingDistribution).map((d) => ({
    name: d.bucket,
    金额: d.amount || 0,
  }));

  // 动态计算 KPI 值
  const arDepts = ensureArray(arData.arByDept);
  const overdueAR = useMemo(() => arDepts.reduce((s, d) => s + (d.ar180360 || 0) + (d.ar360p || 0), 0), [arDepts]);
  const overYearAR = useMemo(() => arDepts.reduce((s, d) => s + (d.ar360p || 0), 0), [arDepts]);
  const top10Share = useMemo(() => ensureArray(arData.top10Customers).reduce((s, d) => s + (d.share || 0), 0), [arData]);
  const totalAR = arData.totalAR || 0;

  useAnalysis("应收应付", {
    arTotal: totalAR,
    apTotal: apData.totalAP || 0,
    arOverdue: arAgingData[arAgingData.length - 1]?.金额 || 0,
  });

  const customerCols = [
    { key: "name", label: "客户名称", sortable: true },
    { key: "amount", label: "金额(万元)", sortable: true, render: (v) => (v || 0).toFixed(2) },
    { key: "share", label: "占比", sortable: true, render: (v) => `${(v || 0).toFixed(2)}%` },
  ];

  const supplierCols = [
    { key: "name", label: "供应商名称", sortable: true },
    { key: "amount", label: "金额(万元)", sortable: true, render: (v) => (v || 0).toFixed(2) },
  ];

  const personCols = [
    { key: "name", label: "业务员", sortable: true },
    { key: "totalAR", label: "应收总额(万元)", sortable: true, render: (v) => (v || 0).toFixed(2) },
    { key: "collected", label: "已收(万元)", sortable: true, render: (v) => (v || 0).toFixed(2) },
    { key: "remaining", label: "剩余应收(万元)", sortable: true, render: (v) => <span className={(v || 0) > 50 ? "text-negative font-medium" : "text-text-primary"}>{(v || 0).toFixed(2)}</span> },
  ];

  return (
    <div className="space-y-8">
      <h2 className="section-title">应收应付分析</h2>
      <p className="text-sm text-text-muted mt-1">
        应收总额 {totalAR.toLocaleString()} 万元，逾期 {overdueAR.toFixed(0)} 万元 ({totalAR > 0 ? (overdueAR / totalAR * 100).toFixed(1) : 0}%)；
        超一年应收 {overYearAR.toFixed(2)} 万元，需重点关注前十大客户回款进度
      </p>

      {/* AR Section */}
      <div className="crd p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">应收账款</h3>
          <span className="text-xs text-text-muted">实时数据驱动</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard label="应收总额" value={totalAR} unit="万元" />
          <KPICard label="逾期未回款" value={overdueAR} unit="万元" />
          <KPICard label="前十大客户占比" value={top10Share} unit="%" />
          <KPICard label="超一年应收" value={overYearAR} unit="万元" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="应收账龄分布" subtitle="单位：万元">
            <ResponsiveContainer width="100%" height={240}>
              {arAgingData.length > 0 ? (
                <BarChart 
                  key={`ar-aging-${arAgingData.length}`}
                  data={arAgingData} 
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
                  <Bar dataKey="金额" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1000} />
                </BarChart>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-text-muted italic">暂无账龄数据</div>
              )}
            </ResponsiveContainer>
          </ChartCard>
          <div>
            <h4 className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">前十大应收客户</h4>
            <DataTable columns={customerCols} rows={ensureArray(arData.top10Customers)} rowKey="name" />
          </div>
        </div>
      </div>

      {/* AP Section */}
      <div className="crd p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-text-primary">应付账款</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard label="剩余应付(正常)" value={apData.totalAP || 0} unit="万元" />
          <KPICard label="30-60天占比" value={42.30} unit="%" />
          <KPICard label="超一年应付" value={479.62} unit="万元" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="应付账龄分布" subtitle="单位：万元">
            <ResponsiveContainer width="100%" height={240}>
              {apAgingData.length > 0 ? (
                <BarChart 
                  key={`ap-aging-${apAgingData.length}`}
                  data={apAgingData} 
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
                  <Bar dataKey="金额" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1000} />
                </BarChart>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-text-muted italic">暂无账龄数据</div>
              )}
            </ResponsiveContainer>
          </ChartCard>
          <div>
            <h4 className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">前十大应付供应商</h4>
            <DataTable columns={supplierCols} rows={ensureArray(apData.top10Suppliers)} rowKey="name" />
          </div>
        </div>
      </div>

      {/* AR by Person toggle */}
      <div className="crd p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">应收 — 业务员维度</h3>
          <button
            onClick={() => setShowPersonDetail(!showPersonDetail)}
            className="text-xs text-accent hover:text-accent-hover transition-colors"
          >
            {showPersonDetail ? "收起" : "展开"}
          </button>
        </div>
        {showPersonDetail && (
          <DataTable columns={personCols} rows={arByPerson} rowKey="name" />
        )}
      </div>
    </div>
  );
}
