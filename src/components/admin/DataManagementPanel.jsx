import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../ui/DataTable";
import { useDashboardStore } from "../../store/dashboardStore";
import { API } from "../../config/api";

const DATA_TYPES = [
  { key: "departmentData", label: "部门销售", hint: "对应页面：销售分析 -> 各事业部/经营部卡片及趋势图" },
  { key: "expenseBreakdown", label: "费用明细", hint: "对应页面：经营概览 -> 费用支出分析饼图" },
  { key: "bizCustomerTop10", label: "事业部客户TOP10", hint: "对应页面：销售分析 -> 事业部 -> 客户分析表格" },
  { key: "bizProductTop10", label: "事业部产品TOP10", hint: "对应页面：销售分析 -> 事业部 -> 产品分析表格" },
  { key: "onlineSalesData", label: "线上销售", hint: "对应页面：销售分析 -> 线上销售 -> 各渠道利润率表" },
  { key: "arData", label: "应收账款", nested: "top10Customers", hint: "对应页面：应收应付 -> 客户应收排名表" },
  { key: "apData", label: "应付账款", nested: "top10Suppliers", hint: "对应页面：应收应付 -> 供应商应付排名表" },
  { key: "arByPerson", label: "业务员应收", hint: "对应页面：应收应付 -> 业务员回款排名" },
  { key: "inventoryProduct", label: "产品库存", nested: "top10Products", hint: "对应页面：库存分析 -> 产品库龄明细表" },
  { key: "inventorySupplier", label: "供应商库存", nested: "top10Suppliers", hint: "对应页面：库存分析 -> 供应商库存排名" },
  { key: "freightByChannel", label: "运费渠道", hint: "对应页面：运费分析 -> 渠道对比柱状图" },
];

/**
 * 核心逻辑：直接操作 Store，消除中间状态 parsed。
 * 这样可以确保数据流是单向且唯一的，彻底解决同步不及时或数据混乱的问题。
 */
export default function DataManagementPanel() {
  const { data: storeData, batchUpdate, setToast, setDataSource } = useDashboardStore();
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newRow, setNewRow] = useState({});
  const fileRef = useRef(null);

  // 获取当前选中的数据行 - 增加切片显示，解决卡顿
  const fullRows = useMemo(() => {
    const t = DATA_TYPES.find((x) => x.key === type);
    if (!storeData || !t) return [];
    const val = storeData[t.key];
    if (!val) return [];
    if (t.nested) return val[t.nested] || [];
    return Array.isArray(val) ? val : [];
  }, [storeData, type]);

  // 仅预览前 30 条数据，大幅提升渲染性能
  const rows = useMemo(() => fullRows.slice(0, 30), [fullRows]);
  const hasMore = fullRows.length > 30;

  // 更新 Store 数据的通用函数
  const updateStoreData = (updatedRows) => {
    const t = DATA_TYPES.find((x) => x.key === type);
    if (!t) return;

    if (t.nested) {
      batchUpdate({
        [t.key]: { ...storeData[t.key], [t.nested]: updatedRows }
      });
    } else {
      batchUpdate({ [t.key]: updatedRows });
    }
  };

  const handleDelete = (indexInSlice) => {
    const updatedRows = [...fullRows];
    // 找到在原始数组中的真实索引
    const realIndex = indexInSlice; 
    updatedRows.splice(realIndex, 1);
    updateStoreData(updatedRows);
  };

  const handleAdd = () => {
    const schema = fullRows.length > 0 ? fullRows[0] : {};
    const processedRow = {};
    
    // 基础校验：如果 newRow 为空则初始化
    if (Object.keys(newRow).length === 0 && fullRows.length > 0) {
      const emptySchema = {};
      Object.keys(fullRows[0]).forEach(k => emptySchema[k] = "");
      setNewRow(emptySchema);
      return;
    }

    // 类型转换：确保数字类型正确
    Object.keys(newRow).forEach(key => {
      const val = newRow[key];
      const originalType = typeof schema[key];
      if (originalType === 'number') {
        const parsedVal = parseFloat(val);
        processedRow[key] = isNaN(parsedVal) ? 0 : parsedVal;
      } else {
        processedRow[key] = val;
      }
    });

    updateStoreData([...fullRows, processedRow]);
    setIsAdding(false);
    setNewRow({});
  };

  const pollJob = async (jobId, label) => {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 500));
      try {
        const r = await fetch(`${API}/job/${jobId}`);
        const j = await r.json();
        if (j.status === "done") {
          batchUpdate(j.data);
          setDataSource({ filename: label, uploadedAt: Date.now() });
          setToast(`导入成功：${Object.keys(j.data).length} 类数据`, "success");
          navigate("/");
          return;
        }
        if (j.status === "error") {
          setMsg(`解析失败：${j.error}`);
          return;
        }
        setMsg(`${label} ${j.status === "parsing" ? "解析中" : "转换中"}...`);
      } catch { /* continue polling */ }
    }
    setMsg("解析超时，请重试");
  };

  const upload = async (file) => {
    setUploading(true);
    setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    const ext = file.name.split(".").pop().toLowerCase();
    const endpoint = ext === "pptx" ? "pptx" : ext === "docx" ? "docx" : "excel";

    try {
      const res = await fetch(`${API}/upload/${endpoint}`, { method: "POST", body: fd });
      const json = await res.json();
      if (json.status !== "ok") {
        setMsg("上传失败：" + (json.error || "未知错误"));
        setUploading(false);
        return;
      }

      // Excel 走后台线程 + 轮询
      if (json.job_id) {
        setMsg("后台解析中...");
        await pollJob(json.job_id, file.name);
      }
      // PPTX/DOCX 直接返回
      else if (endpoint === "pptx") {
        setMsg(`PPT 解析完成：${json.slides} 页`);
        batchUpdate({ pptxSlides: json.data });
      } else if (endpoint === "docx") {
        setMsg(`Word 解析完成：${json.data.paragraph_count} 段`);
        batchUpdate({ docxData: json.data });
      }
    } catch (e) {
      setMsg("后端未连接 (localhost:8000)");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveToServer = async () => {
    try {
      const res = await fetch(`${API}/data/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: storeData }),
      });
      if (res.ok) {
        setMsg("数据已成功保存至服务端");
      } else {
        setMsg("服务端保存失败");
      }
    } catch (e) {
      setMsg("连接服务端失败");
    }
    setTimeout(() => setMsg(""), 3000);
  };

  const columns = useMemo(() => {
    if (!rows.length) return [];
    const baseCols = Object.keys(rows[0])
      .filter((k) => k !== "total")
      .map((k) => ({
        key: k,
        label: k,
        sortable: true,
        render: (v) => (typeof v === "number" ? v.toFixed(2) : String(v ?? "")),
      }));
    
    return [
      ...baseCols,
      {
        key: "actions",
        label: "操作",
        sortable: false,
        render: (_, row) => (
          <button
            onClick={() => handleDelete(rows.indexOf(row))}
            className="text-negative hover:text-negative/80 font-bold px-2 py-1"
          >
            删除
          </button>
        )
      }
    ];
  }, [rows]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
        {/* 数据导入 */}
        <div className="crd p-4 bg-white/5 border border-white/10 rounded-xl">
          <h4 className="text-xs font-semibold text-text-primary mb-3 uppercase tracking-wider">数据导入</h4>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full py-2.5 px-4 rounded-lg bg-accent/20 border border-accent/30 text-accent text-sm font-medium hover:bg-accent/30 transition-all flex items-center justify-center gap-2"
            >
              {uploading ? "正在处理..." : "选择 Excel/PPTX/Word"}
            </button>
            <input
              type="file"
              ref={fileRef}
              className="hidden"
              accept=".xlsx,.xls,.pptx,.docx"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
            {msg && <p className="text-[11px] text-positive mt-1 animate-pulse text-center">{msg}</p>}
          </div>
        </div>

        {/* 同步按钮 */}
        <div className="px-1">
          <button
            onClick={handleSaveToServer}
            className="w-full py-3 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
          >
            保存并同步到服务器
          </button>
        </div>

        {/* 数据预览与编辑 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">数据预览</h4>
            {type && !isAdding && (
              <button
                onClick={() => {
                  const schema = rows.length > 0 ? Object.keys(rows[0]) : [];
                  const empty = {};
                  schema.forEach(k => empty[k] = "");
                  setNewRow(empty);
                  setIsAdding(true);
                }}
                className="text-[11px] font-bold text-accent hover:text-accent-hover flex items-center gap-1"
              >
                + 新增数据
              </button>
            )}
          </div>

          <div className="relative group">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setIsAdding(false);
              }}
              className="w-full bg-bg-card border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50"
            >
              <option value="">选择数据类型...</option>
              {DATA_TYPES.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
            {type && (
              <div className="mt-2 px-3 py-2 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0 animate-pulse" />
                <p className="text-[11px] text-accent font-medium leading-relaxed">
                  {DATA_TYPES.find(t => t.key === type)?.hint}
                </p>
              </div>
            )}
          </div>

          {/* 新增表单 */}
          {isAdding && (
            <div className="crd p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-3">
              <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.keys(newRow).map((key) => (
                  <div key={key}>
                    <label className="text-[10px] text-text-muted mb-1 block">{key}</label>
                    <input
                      type="text"
                      value={newRow[key]}
                      onChange={(e) => setNewRow({ ...newRow, [key]: e.target.value })}
                      className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent/30"
                      placeholder={`输入 ${key}...`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleAdd} className="flex-1 py-2 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent-hover">确认</button>
                <button onClick={() => setIsAdding(false)} className="flex-1 py-2 rounded-lg bg-white/5 text-text-secondary text-xs font-medium">取消</button>
              </div>
            </div>
          )}

          {/* 数据列表 */}
          {type && rows.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="crd p-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col min-h-[200px]">
                <div className="overflow-auto text-[11px] custom-scrollbar">
                  <DataTable columns={columns} rows={rows} />
                </div>
              </div>
              {hasMore && (
                <p className="text-[10px] text-text-muted text-center italic">
                  仅预览前 30 条数据（共 {fullRows.length} 条），修改将同步至全量。
                </p>
              )}
            </div>
          ) : type ? (
            <p className="text-center py-8 text-xs text-text-muted italic">暂无数据</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
