import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import DataTable from "../components/ui/DataTable";
import KPICard from "../components/ui/KPICard";
import ChartCard, { CustomTooltip } from "../components/charts/ChartCard";
import { useAnalysis } from "../components/analysis/AnalysisContext";
import { useDashboardStore } from "../store/dashboardStore";
import { selectFreightChartData, ensureArray, ensureObject } from "../store/selectors";

export default function Freight() {
  const { data } = useDashboardStore();
  const freightOverview = ensureObject(data?.freightOverview);
  const freightByChannel = ensureArray(data?.freightByChannel);

  const channelChartData = selectFreightChartData(data);
  const detailData = freightByChannel;

  useAnalysis("运费分析", {
    feeRatio: freightOverview.feeRatio || 0,
    avgPerTicket: freightByChannel[0]?.avgPerTicket || 20.75,
  });

  const channelCols = [
    { key: "channel", label: "快递渠道", sortable: true },
    { key: "freight", label: "本月运费(万)", sortable: true, render: (v) => (v || 0) > 0 ? (v || 0).toFixed(2) : "-" },
    { key: "tickets", label: "本月票数", sortable: true, render: (v) => (v || 0) > 0 ? (v || 0).toLocaleString() : "-" },
    { key: "avgPerTicket", label: "本月每票运费(元)", sortable: true, render: (v) => (v || 0) > 0 ? `${(v || 0).toFixed(2)}元` : "-" },
    { key: "feeRatio", label: "本月费比", sortable: true, render: (v) => (v || 0) > 0 ? `${(v || 0).toFixed(2)}%` : "-" },
  ];

  const totalFreight = freightOverview.totalFreight || 0;
  const lastMonthFreight = freightOverview.lastMonthFreight || 1;
  const totalTickets = freightOverview.totalTickets || 0;
  const lastMonthTickets = freightOverview.lastMonthTickets || 1;
  const feeRatio = freightOverview.feeRatio || 0;
  const lastMonthFeeRatio = freightOverview.lastMonthFeeRatio || 0;

  return (
    <div className="space-y-8">
      <h2 className="section-title">运费分析</h2>
      <p className="text-sm text-text-muted mt-1">
        本月运费 {totalFreight.toFixed(2)} 万元，费比 {feeRatio.toFixed(2)}%；
        环比变动 {(totalFreight - lastMonthFreight).toLocaleString()} 元
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          label="本月运费总额"
          value={totalFreight}
          unit="万元"
          change={((totalFreight - lastMonthFreight) / lastMonthFreight) * 100}
          changeLabel="环比变化"
        />
        <KPICard
          label="本月总票数"
          value={totalTickets}
          unit="票"
          change={((totalTickets - lastMonthTickets) / lastMonthTickets) * 100}
          changeLabel="环比变化"
        />
        <KPICard
          label="本月费比"
          value={feeRatio}
          unit="%"
          change={feeRatio - lastMonthFeeRatio}
          changeLabel={`vs 上月 ${lastMonthFeeRatio.toFixed(2)}%`}
        />
        <KPICard
          label="每票运费"
          value={20.75}
          unit="元"
          change={20.75 - 21.31}
          changeLabel="vs 上月 21.31元"
        />
        <KPICard
          label="每票货值"
          value={1875}
          unit="元"
          change={1875 - 1375}
          changeLabel="vs 上月 1375元"
        />
      </div>

      {/* Charts & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="各渠道运费对比" subtitle="单位：万元">
          {channelChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                key={`freight-channel-${channelChartData.length}`}
                data={channelChartData} 
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
                <Bar dataKey="运费" fill="#38BDF8" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-text-muted italic text-xs">
              暂无运费渠道数据
            </div>
          )}
        </ChartCard>

        <div className="crd p-8">
          <h3 className="text-sm font-bold text-text-primary mb-6">月度趋势概览</h3>
          <div className="space-y-6 mt-4">
            <div className="flex justify-between items-center p-5 bg-white/[0.03] rounded-2xl border border-white/5">
              <div>
                <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest mb-1">运费总额环比</p>
                <p className={`text-2xl font-bold ${(totalFreight - lastMonthFreight) <= 0 ? "text-positive" : "text-negative"}`}>
                  {(totalFreight - lastMonthFreight).toLocaleString()} <span className="text-xs font-medium">元</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-text-muted mb-1">上月: {lastMonthFreight.toLocaleString()}元 → 本月: {totalFreight.toLocaleString()}元</p>
                <p className={`text-xs font-bold ${feeRatio <= lastMonthFeeRatio ? "text-positive" : "text-negative"}`}>
                  费比从 {lastMonthFeeRatio.toFixed(2)}% 变动至 {feeRatio.toFixed(2)}%
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center p-5 bg-white/[0.03] rounded-2xl border border-white/5">
              <div>
                <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest mb-1">票数变化</p>
                <p className={`text-2xl font-bold ${(totalTickets - lastMonthTickets) <= 0 ? "text-positive" : "text-negative"}`}>
                  {(totalTickets - lastMonthTickets).toLocaleString()} <span className="text-xs font-medium">票</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-text-muted mb-1">上月: {lastMonthTickets.toLocaleString()}票 → 本月: {totalTickets.toLocaleString()}票</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Detail Table */}
      <div className="crd p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">运费渠道明细</h3>
        <DataTable columns={channelCols} rows={detailData} rowKey="channel" />
      </div>
    </div>
  );
}
