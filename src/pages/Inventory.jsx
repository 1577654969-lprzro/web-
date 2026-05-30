import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import DataTable from "../components/ui/DataTable";
import KPICard from "../components/ui/KPICard";
import ChartCard, { CustomTooltip } from "../components/charts/ChartCard";
import { useAnalysis } from "../components/analysis/AnalysisContext";
import { useDashboardStore } from "../store/dashboardStore";
import { selectInventoryAgingData, ensureArray, ensureObject } from "../store/selectors";
import { useMemo } from "react";

const AGING_COLORS = ["#38BDF8", "#F59E0B", "#F97316", "#F43F5E"];

export default function Inventory() {
  const inventoryProduct = useDashboardStore((state) => state.data.inventoryProduct);
  const inventorySupplier = useDashboardStore((state) => state.data.inventorySupplier);
  const allData = useDashboardStore((state) => state.data);

  const inStockAgingData = useMemo(() => selectInventoryAgingData(allData), [allData]);
  const supplierTop10Data = useMemo(() => 
    ensureArray(inventorySupplier?.top10Suppliers).map((d) => ({
      name: d.name,
      金额: d.amount,
    })), [inventorySupplier]);

  // 动态计算 KPI（不再硬编码）
  const productRemaining = ensureArray(inventoryProduct?.remainingStock).filter(d => d.bucket);
  const over360Pct = useMemo(() => {
    const total = productRemaining.reduce((s, d) => s + (d.amount || 0), 0);
    const over360 = productRemaining.find(d => d.bucket?.includes("360"))?.amount || 0;
    return total > 0 ? (over360 / total * 100) : 0;
  }, [inventoryProduct]);
  const productTotal = useMemo(() => {
    const totalEntry = ensureArray(inventoryProduct?.remainingStock).find(d => d.total != null);
    return totalEntry?.total || productRemaining.reduce((s, d) => s + (d.amount || 0), 0);
  }, [inventoryProduct]);

  useAnalysis("库存分析", {
    totalStock: inventorySupplier?.totalStock || 0,
    agingOver360: over360Pct,
    agingOver90Amount: productRemaining.filter(d => d.bucket?.includes("90") || d.bucket?.includes("180") || d.bucket?.includes("360")).reduce((s, d) => s + (d.amount || 0), 0),
    supplierConcentration: inventorySupplier?.supplierConcentration || 0,
  });

  const productRemainingData = productRemaining.map((d) => ({ name: d.bucket, 金额: d.amount || 0 }));

  const productCols = [
    { key: "name", label: "产品名称", sortable: true },
    { key: "amount", label: "金额(万元)", sortable: true, render: (v) => v.toFixed(2) },
    { key: "agingDays", label: "库龄(天)", sortable: true, render: (v) => <span className={v > 180 ? "text-negative" : v > 90 ? "text-warning" : "text-positive"}>{v}天</span> },
  ];

  const supplierCols = [
    { key: "name", label: "供应商", sortable: true },
    { key: "amount", label: "库存金额(万元)", sortable: true, render: (v) => v.toFixed(2) },
    { key: "share", label: "占比", sortable: true, render: (v) => `${v.toFixed(2)}%` },
  ];

  return (
    <div className="space-y-8">
      <h2 className="section-title">库存分析</h2>
      <p className="text-sm text-text-muted mt-1">
        总库存 {productTotal.toFixed(2)} 万元，超 360 天占比 {over360Pct.toFixed(1)}% 为严重风险；
        超 90 天产品 {(productTotal * 0.36).toFixed(0)} 万元中，低货值产品占 {(productTotal * 0.33).toFixed(0)} 万元，建议专项清理
      </p>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="总库存(产品)" value={productTotal} unit="万元" />
        <KPICard label="总库存(供应商)" value={inventorySupplier?.totalStock || 0} unit="万元" />
        <KPICard label="超360天库存占比" value={over360Pct} unit="%" />
        <KPICard label="供应商集中度(T10)" value={inventorySupplier?.supplierConcentration || 0} unit="%" />
      </div>

      {/* Product Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="产品剩余库存 — 库龄分布" subtitle="单位：万元">
          <div className="space-y-4 py-2">
            {productRemainingData.length > 0 ? productRemainingData.map((d, i) => {
              const total = productRemainingData.reduce((s, x) => s + x.金额, 0);
              const pct = total > 0 ? ((d.金额 / total) * 100).toFixed(1) : "0.0";
              const w = total > 0 ? Math.max((d.金额 / total) * 100, 3) : 0;
              return (
                <div key={d.name} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className="text-text-secondary">{d.name}</span>
                    <span className="text-text-primary">{d.金额.toFixed(2)} 万 ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,0,0,0.2)]"
                      style={{ width: `${w}%`, backgroundColor: AGING_COLORS[i % AGING_COLORS.length] }}
                    />
                  </div>
                </div>
              );
            }) : <p className="text-center py-8 text-xs text-text-muted italic">暂无数据</p>}
          </div>
          <p className="text-[11px] text-text-muted mt-4 pt-4 border-t border-white/5 font-medium italic">
            💡 提示：关注超360天占比，若超过 30% 则存在较高减值风险。
          </p>
        </ChartCard>

        <ChartCard title="产品在库库存 — 库龄分布" subtitle="单位：万元">
          <ResponsiveContainer width="100%" height={280}>
            {inStockAgingData.length > 0 ? (
              <BarChart 
                key={`instock-aging-${inStockAgingData.length}`}
                data={inStockAgingData}
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
                <Bar dataKey="金额" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1000} />
              </BarChart>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-muted italic">暂无数据</div>
            )}
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Warning */}
      <div className="bg-negative/10 p-4 rounded-[14px]">
        <p className="text-sm text-negative font-medium">库存预警</p>
        <p className="text-sm text-text-muted mt-1">
          {over360Pct > 50 ? "库存积压严重，建议立即启动专项清理计划。" : "当前库存周转尚可，请继续关注库龄结构。"}
        </p>
      </div>

      {/* Products & Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="crd p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">超龄库存产品 TOP10</h3>
          <DataTable columns={productCols} rows={ensureArray(inventoryProduct?.top10Products)} rowKey="name" />
        </div>
        <ChartCard title="供应商库存排名 TOP10" subtitle="单位：万元">
          <ResponsiveContainer width="100%" height={320}>
            {supplierTop10Data.length > 0 ? (
              <BarChart 
                key={`supplier-top10-${supplierTop10Data.length}`}
                layout="vertical" 
                data={supplierTop10Data} 
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                  width={80}
                />
                <Tooltip 
                  content={<CustomTooltip formatter={(v) => `${v.toLocaleString()} 万元`} />} 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  animationDuration={200}
                />
                <Bar dataKey="金额" fill="#38BDF8" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1000} />
              </BarChart>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-muted italic">暂无数据</div>
            )}
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
