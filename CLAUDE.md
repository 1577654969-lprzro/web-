# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

至远药业集团经营数据看板系统 — 将 PPTX+Excel 手工报表迁移为 Web 看板。
当前阶段：纯前端 UI，使用 mock 数据（后端后续接入）。

## 常用命令

```bash
npm install              # 安装依赖
npm run dev              # 启动开发服务器 (localhost:5173)
npm run build            # 生产构建
npm run preview          # 预览生产构建
```

## 技术栈

- **Vite 6 + React 19** — 构建工具和框架
- **Tailwind CSS v4** — 使用 `@tailwindcss/vite` 插件，自定义主题定义在 `src/index.css`
- **React Router v7** — 客户端路由
- **Recharts** — 图表库

## 目录结构

```
src/
├── data/mockData.js          # 所有 mock 数据（从 数据.xlsx 提取）
├── components/
│   ├── Layout.jsx             # 侧边栏 + 内容区布局 (React Router Outlet)
│   ├── Sidebar.jsx            # 固定左侧导航（5 个模块）
│   ├── KPICard.jsx            # KPI 指标卡片组件
│   └── DataTable.jsx          # 通用可排序表格组件
├── pages/
│   ├── Overview.jsx           # 经营概览 — 收入/毛利/费用 KPI + 图表
│   ├── SalesAnalysis.jsx      # 销售分析 — 5 部门 Tab 切换 + 排名表
│   ├── ReceivablePayable.jsx  # 应收应付 — 账龄分布 + 客户/供应商排名
│   ├── Inventory.jsx          # 库存分析 — 库龄饼图 + 超龄预警
│   └── Freight.jsx            # 运费分析 — 渠道对比 + 费比趋势
├── App.jsx                    # 路由配置 (BrowserRouter)
├── main.jsx                   # 入口
└── index.css                  # Tailwind v4 导入 + 自定义主题色
```

## 设计系统

- **暗色主题**: 背景 `#0F172A`, 卡片 `#1E293B`, 侧边栏 `#0B1121`
- **强调色**: 青色 `#06B6D4`, 正向 `#10B981`, 负向 `#EF4444`, 警告 `#F59E0B`
- **数据模块**: 5 大板块对应 PPTX 报告的 5 个章节
  - 收入毛利费用对比（Overview）
  - 销售分析（SalesAnalysis）— 事业部 / 经营部 / 平台运营 / C端电商 / 线上销售
  - 应收应付（ReceivablePayable）
  - 库存分析（Inventory）
  - 运费分析（Freight）

## 源数据

- `D:\数据.xlsx` — 17 个 Sheet（P4-P24），当前 mock 数据来源
- `D:\至远管报汇报-202604(2).pptx` — 25 页报告幻灯片（所有图表均为截图，非原生图表）
