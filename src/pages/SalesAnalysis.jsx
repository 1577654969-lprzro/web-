import { useState, useMemo } from "react";
import DataTable from "../components/ui/DataTable";
import KPICard from "../components/ui/KPICard";
import { useAnalysis } from "../components/analysis/AnalysisContext";
import { useDashboardStore } from "../store/dashboardStore";
import { ensureArray, ensureObject } from "../store/selectors";

const tabs = [
  { key: "biz", label: "事业部" },
  { key: "ops", label: "经营部" },
  { key: "platform", label: "平台运营" },
  { key: "cstore", label: "C端电商" },
  { key: "online", label: "线上销售" },
];

export default function SalesAnalysis() {
  const { data } = useDashboardStore();
  const departmentData = ensureArray(data?.departmentData);
  const bizCustomerTop10 = ensureArray(data?.bizCustomerTop10);
  const bizProductTop10 = ensureArray(data?.bizProductTop10);
  const keyCustomerData = ensureObject(data?.keyCustomerData);
  const onlineSalesData = ensureArray(data?.onlineSalesData);

  const [activeTab, setActiveTab] = useState("biz");

  const grossMargin = useMemo(() => 
    departmentData.find(d => d.dept === "事业部")?.grossProfitRate202604 || 0,
    [departmentData]
  );

  const top10Share = useMemo(() => 
    activeTab === "biz" ? bizCustomerTop10.reduce((s, c) => s + (c.share || 0), 0) : 0,
    [activeTab, bizCustomerTop10]
  );

  useAnalysis("销售分析", {
    grossMargin,
    top10Share,
    concentrationLabel: "客户",
  });

  return (
    <div className="space-y-8">
      <h2 className="section-title">销售分析</h2>
      <p className="text-sm text-text-muted mt-1">
        事业部毛利率 {grossMargin.toFixed(2)}%，前十大客户收入占比 {top10Share.toFixed(1)}%；
        线上渠道综合利润率 4.17%，拼多多渠道表现最优
      </p>

      {/* Department Tabs */}
      <div className="flex gap-1 bg-bg-card rounded-[11px] p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-[13px] rounded-[9px] font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-black shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Department Overview Cards */}
      {activeTab !== "online" && activeTab !== "cstore" && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {departmentData.length > 0 ? departmentData.map((d) => (
            <div key={d.dept} className="crd p-4">
              <p className="text-xs text-text-muted">{d.dept}</p>
              <p className="text-lg font-bold mt-1">{(d.revenue202604 || 0).toLocaleString()} <span className="text-xs text-text-muted font-normal">万元</span></p>
              <p className="text-xs mt-1">
                <span className={(d.revenueChange || 0) >= 0 ? "text-positive" : "text-negative"}>
                  {(d.revenueChange || 0) >= 0 ? "+" : ""}{(d.revenueChange || 0).toFixed(2)}%
                </span>
                <span className="text-text-muted ml-1">环比</span>
              </p>
              <p className="text-sm text-text-muted mt-1">毛利率 {(d.grossProfitRate202604 || 0).toFixed(2)}%</p>
            </div>
          )) : <div className="col-span-full py-12 text-center text-text-muted italic text-sm">暂无部门数据</div>}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "biz" && <BizContent bizCustomerTop10={bizCustomerTop10} bizProductTop10={bizProductTop10} keyCustomerData={keyCustomerData} />}
      {activeTab === "ops" && <DeptContent dept="经营部" departmentData={departmentData} />}
      {activeTab === "platform" && <DeptContent dept="平台运营" departmentData={departmentData} />}
      {activeTab === "cstore" && <DeptContent dept="C端电商" departmentData={departmentData} />}
      {activeTab === "online" && <OnlineContent onlineSalesData={onlineSalesData} />}
    </div>
  );
}

function BizContent({ bizCustomerTop10, bizProductTop10, keyCustomerData }) {
  const customerCols = [
    { key: "name", label: "客户名称", sortable: true },
    { key: "revenue", label: "含税收入(万元)", sortable: true, render: (v) => (v || 0).toFixed(2) },
    { key: "share", label: "收入占比", sortable: true, render: (v) => `${(v || 0).toFixed(2)}%` },
    { key: "grossRate", label: "毛利率", sortable: true, render: (v) => <span className={(v || 0) >= 0 ? "text-positive" : "text-negative"}>{(v || 0).toFixed(2)}%</span> },
  ];

  const productCols = [
    { key: "name", label: "产品名称", sortable: true },
    { key: "revenue", label: "含税收入(万元)", sortable: true, render: (v) => (v || 0).toFixed(2) },
    { key: "share", label: "收入占比", sortable: true, render: (v) => `${(v || 0).toFixed(2)}%` },
    { key: "grossRate", label: "毛利率", sortable: true, render: (v) => <span className={(v || 0) >= 0 ? "text-positive" : "text-negative"}>{(v || 0).toFixed(2)}%</span> },
  ];

  const keyCustomerTop10 = ensureArray(keyCustomerData?.top10);
  const keyCustomerStrategy = ensureObject(keyCustomerData?.strategy);

  return (
    <div className="space-y-8">
      <div className="crd p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">事业部门 — 客户分析 TOP10</h3>
        <DataTable columns={customerCols} rows={bizCustomerTop10} rowKey="name" />
      </div>

      <div className="crd p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">事业部门 — 产品分析 TOP10</h3>
        <DataTable columns={productCols} rows={bizProductTop10} rowKey="name" />
      </div>

      <div className="crd p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">大客户部</h3>
        <DataTable
          columns={[
            { key: "name", label: "客户", sortable: true },
            { key: "revenue", label: "收入(万元)", sortable: true, render: (v) => (v || 0).toFixed(2) },
            { key: "share", label: "占比", sortable: true, render: (v) => `${(v || 0).toFixed(2)}%` },
            { key: "grossRate", label: "毛利率", sortable: true, render: (v) => <span className={(v || 0) >= 0 ? "text-positive" : "text-negative"}>{(v || 0).toFixed(2)}%</span> },
          ]}
          rows={keyCustomerTop10}
          rowKey="name"
        />
        {keyCustomerStrategy.issue && (
          <div className="mt-3 p-4 bg-warning/10 rounded-[12px]">
            <p className="text-xs text-warning font-medium">风险提示：{keyCustomerStrategy.issue}</p>
            <p className="text-sm text-text-muted mt-1">建议：{keyCustomerStrategy.action}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DeptContent({ dept, departmentData }) {
  const d = departmentData.find((d) => d.dept === dept);

  return (
    <div className="crd p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-3">{dept} — 经营数据</h3>
      {d ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <p className="text-xs text-text-muted">本月收入</p>
            <p className="text-lg font-bold">{(d.revenue202604 || 0).toLocaleString()} <span className="text-xs font-normal text-text-muted">万元</span></p>
          </div>
          <div>
            <p className="text-xs text-text-muted">环比变化</p>
            <p className={`text-lg font-bold ${(d.revenueChange || 0) >= 0 ? "text-positive" : "text-negative"}`}>
              {(d.revenueChange || 0) >= 0 ? "+" : ""}{(d.revenueChange || 0).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted">毛利率</p>
            <p className="text-lg font-bold">{(d.grossProfitRate202604 || 0).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">毛利额</p>
            <p className="text-lg font-bold">{(d.grossProfit202604 || 0).toFixed(2)} <span className="text-xs font-normal text-text-muted">万元</span></p>
          </div>
          <div>
            <p className="text-xs text-text-muted">边际贡献率</p>
            <p className="text-lg font-bold">{(d.marginShare || 0).toFixed(2)}%</p>
          </div>
        </div>
      ) : (
        <p className="text-center py-12 text-text-muted italic text-sm">暂无 {dept} 的详细经营数据</p>
      )}
      <p className="text-xs text-text-muted">详细产品/客户数据将在后续版本中呈现。</p>
    </div>
  );
}

function OnlineContent({ onlineSalesData }) {
  const cols = [
    { key: "channel", label: "渠道", sortable: true },
    { key: "revenue", label: "收入(万元)", sortable: true, render: (v) => (v || 0).toFixed(2) },
    { key: "grossProfit", label: "毛利(万元)", sortable: true, render: (v) => (v || 0).toFixed(2) },
    { key: "platformFee", label: "平台费(万元)", sortable: true, render: (v) => (v || 0).toFixed(2) },
    { key: "netRate", label: "净利润率", sortable: true, render: (v) => <span className={(v || 0) >= 0 ? "text-positive" : "text-negative"}>{(v || 0).toFixed(2)}%</span> },
  ];

  return (
    <div className="space-y-8">
      <div className="crd p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">线上销售 — 渠道对比</h3>
        <DataTable columns={cols} rows={onlineSalesData} rowKey="channel" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="线上综合利润率" value={4.17} unit="%" />
        <KPICard label="运费率" value={0.67} unit="%" />
      </div>
    </div>
  );
}

