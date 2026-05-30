# CLAUDE.md — 至远药业经营数据看板

## 命令
```bash
npm run dev              # 前端 :5173
npm run build            # 构建
cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000  # 后端 :8000
```

## 技术栈
- **前端**: React 19 + Vite 6 + Tailwind 4 + Zustand + Recharts + React Router v7
- **后端**: FastAPI + aiosqlite + calamine(Rust引擎) + openpyxl(fallback)
- **解析**: Agent 列名/Sheet名语义匹配 (`column_matcher.py`)
- **存储**: SQLite (`backend/data/dashboard.db`)
- **格式适配**: `adapter_66mb.py` 处理 66MB 绩效 Excel

## 目录（当前实际）
```
src/
├── pages/         6页面(Overview/Sales/ReceivablePayable/Inventory/Freight/Admin)
├── components/
│   ├── ui/        KPICard, DataTable, ErrorBoundary, DebugPanel
│   ├── layout/    Layout, Sidebar, StatusBar
│   ├── charts/    ChartCard
│   ├── analysis/  ToolboxPanel, SideDock, AnalysisContext, AnalysisMessage
│   └── admin/     DataManagementPanel, FileVault
├── store/         Zustand (dashboardStore + selectors + sync)
├── adapters/      mockAdapter, apiAdapter
├── schemas/       dashboard.js (withDefaults)
├── services/      dataLoader, syncService
├── hooks/         useSortable, useChartConfig, useDashboardData
├── lib/           analysisEngine, chartTheme, normalizeData
├── config/        api.js, chartDefaults.js
└── data/          mockData.js
backend/
├── app/           main.py, db.py, config.py
│   └── api/       router.py, vault.py
├── file_parser/   excel_reader, data_transformer, column_matcher, adapter_66mb, mappings
├── smart_analysis/ engine.py
└── models/        dashboard.py
```

## 数据流
```
Excel → calamine读取 → adapter_66mb/transform → SQLite uploads.parsed_data
  → vault/sync → apiAdapter → withDefaults(真数据覆盖mock,没提取的留空)
  → Zustand batchUpdate(startTransition) → 6页面自动渲染
```

## 关键设计规则
- 公司看板**禁止假数据混合**：没提取到的字段留空/"暂无数据"，不用mock填充
- 每次解析后**必须弹确认窗**显示预览，用户确认后才推送
- `withDefaults` 只覆盖真正有数据的字段（数值>0/数组非空）
- 颜色: 暗色主题，accent=#38BDF8, positive=#10B981, negative=#F43F5E, warning=#F59E0B
- 前端端口5173 后端端口8000，CORS全开
- 每次改动后 `npm run build` 验证编译
