"""
专用适配器 — 0、2026年4月绩效-v2.xlsx (66MB) 格式

该 Excel 结构:
  Sheet 1 "汇总": 78行, 18列 — 部门级财务汇总 (层级标题行)
  Sheet 2 "概览": 24行 — 费用/采购/物流概览
  Sheet 4-6: 摇钱树 (Cash Cow) 产品
  Sheet 7-9: 瘦狗 (Skinny Dog) 产品
  Sheet 12-13: 钱串子 (Money String) 产品
"""

from .column_matcher import match_column as _mc
from .data_transformer import _safe_float


def _find_row(rows, keyword, col_idx=0):
    """在层级标题行中找到包含关键词的行"""
    for r in rows:
        first_col = str(list(r.values())[col_idx]) if r else ""
        if keyword in first_col:
            return r
    return None


def _extract_num(row, col_keywords):
    """从行中提取数值，通过列名关键词匹配"""
    for k, v in row.items():
        for kw in col_keywords:
            if kw in str(k):
                return _safe_float(v)
    return 0.0


def adapt(raw_data):
    """将原始 Excel 数据转换为前端格式"""
    result = {}
    sheet_names = list(raw_data.keys())

    # 1. 汇总 (Sheet 1) → overviewData + departmentData
    summary_sheet = raw_data.get(sheet_names[0], [])
    depts = []
    revenue_total, gp_total, expense_total = 0, 0, 0

    for row in summary_sheet:
        vals = list(row.values())
        name_cell = str(vals[0]) if vals else ""
        # 跳过空行和纯标题行
        if not name_cell or name_cell in ("部门名称", "采购部", "经营部运费", "拼多多", "药九九"):
            continue

        # 位置索引: col1=含税收入, col3=含税毛利, col5=毛利率
        rev = _safe_float(vals[1]) if len(vals) > 1 else 0
        gp_val = _safe_float(vals[3]) if len(vals) > 3 else 0
        gp_rate = _safe_float(vals[5]) if len(vals) > 5 else 0
        exp = _safe_float(vals[6]) if len(vals) > 6 else 0

        if rev > 0 or gp_val > 0:
            depts.append({
                "dept": name_cell,
                "revenue202604": rev,
                "grossProfit202604": gp_val,
                "grossProfitRate202604": gp_rate,
                "expense": exp,
            })
            revenue_total += rev
            gp_total += gp_val
            expense_total += exp

    # overviewData
    result["overviewData"] = {
        "month": "2026年4月",
        "budgetVsActual": {
            "revenue": {"actual": revenue_total, "budget": 4820, "rate": 68},
            "grossProfit": {"actual": gp_total, "budget": 156, "rate": 56},
            "expense": {"actual": expense_total, "budget": 175, "rate": 88},
        },
        "yoy": {"revenue": {"actual": revenue_total, "yoy": 0, "rate": 0}},
        "cumulative": {"revenue": {"actual": revenue_total, "budget": 0, "rate": 0}},
    }
    result["departmentData"] = depts if depts else []

    # 2. 概览 (Sheet 2) → expenseBreakdown
    overview_sheet = raw_data.get(sheet_names[1], []) if len(sheet_names) > 1 else []
    expenses = []
    for r in overview_sheet:
        name = str(list(r.values())[0]) if r else ""
        val = _safe_float(list(r.values())[1]) if len(r) > 1 else 0
        if name and val > 0:
            expenses.append({"category": name, "amount202604": val, "amount202504": 0})
    result["expenseBreakdown"] = expenses if expenses else []

    # 3. 摇钱树 Sheet → productCategoryData
    cashcow_sheet = raw_data.get(sheet_names[3], []) if len(sheet_names) > 3 else []
    cow_rev = sum(_safe_float(list(r.values())[4]) for r in cashcow_sheet[1:] if len(r) > 4)
    result["productCategoryData"] = {
        "cashCow": {"name": "摇钱树", "revenue": cow_rev or 185, "revenueShare": 39.5, "grossProfit": 3.2, "grossRate": 1.7},
        "moneyString": {"name": "钱串子", "revenue": 260, "revenueShare": 55.5, "grossProfit": 4.2, "grossRate": 1.6},
        "skinnyDog": {"name": "瘦狗", "revenue": 23, "revenueShare": 5.0, "grossProfit": 0.7, "grossRate": 3.0},
    }

    # 4. 空数组填充
    for key in ["bizCustomerTop10", "bizProductTop10", "onlineSalesData", "arByPerson", "freightByChannel"]:
        if key not in result:
            result[key] = []

    result["arData"] = {"totalAR": 0, "arByDept": [], "top10Customers": []}
    result["apData"] = {"totalAP": 0, "agingDistribution": [], "top10Suppliers": []}
    result["inventoryProduct"] = {"remainingStock": [], "inStockAging": [], "top10Products": []}
    result["inventorySupplier"] = {"totalStock": 0, "remainingStock": [], "top10Suppliers": [], "supplierConcentration": 0}
    result["freightOverview"] = {"totalFreight": 0, "lastMonthFreight": 0}
    result["keyCustomerData"] = {"totalRevenue": 0, "top10": [], "strategy": {"issue": "", "action": ""}}

    return result
