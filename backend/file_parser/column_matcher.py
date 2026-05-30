"""
列名语义匹配引擎 — 本地规则引擎，零外部依赖

原理：
1. 每个目标字段定义一组关键词（中英文、同义词）
2. 输入 Excel 列名，计算与所有目标字段的匹配分数
3. 返回最高分匹配（超过阈值）或 None

用法:
    from file_parser.column_matcher import match_column
    match_column("含税收入(万元)") → ("revenue", 1.0)
"""

import re
from .mappings import SMART_ALIASES

# 扩展原有的 FIELD_KEYWORDS，合并 SMART_ALIASES
FIELD_KEYWORDS = {
    # 收入相关
    "revenue": ["收入", "营收", "销售额", "含税收入", "不含税收入", "revenue", "sales"],
    "revenue_actual": ["收入_实际", "实际收入", "本月收入", "营收_实际", "Revenue_Actual"],
    "revenue_budget": ["收入_预算", "预算收入", "目标收入", "Revenue_Budget"],
    "revenue_rate": ["收入_达成率", "达成率", "完成率", "Revenue_Rate"],
    
    # 毛利相关
    "gross_profit": ["毛利", "毛利额", "gross profit"],
    "gp_actual": ["毛利_实际", "实际毛利", "毛利额", "GrossProfit_Actual"],
    "gp_budget": ["毛利_预算", "预算毛利", "GrossProfit_Budget"],
    "gp_rate": ["毛利_达成率", "毛利率", "GP_Rate", "margin"],

    # 费用相关
    "expense": ["费用", "支出", "花费"],
    "expense_actual": ["费用_实际", "实际费用", "本月支出", "Expense_Actual"],
    "expense_budget": ["费用_预算", "预算费用", "Expense_Budget"],
    "expense_rate": ["费用_使用率", "费用率", "Expense_Rate"],

    # 客户/产品/通用
    "customer": ["客户", "买方", "采购方"],
    "product": ["产品", "商品", "品名"],
    "share": ["占比", "收入占比", "份额", "比重", "share", "%"],
    "gross_rate": ["毛利率", "利润率", "gross rate", "GrossRate"],
    "name": ["客户名称", "产品名称", "名称", "名字", "供应商名称", "name", "Name"],
    "amount": ["金额", "万元", "库存金额", "应收金额", "amount", "Amount"],
    "dept": ["部门", "事业部", "板块", "经营部", "dept", "Dept"],
    "channel": ["渠道", "快递渠道", "平台", "channel", "Channel"],

    # 更多具体字段映射可以继续通过 SMART_ALIASES 合并
}

# 合并 mappings.py 中的 SMART_ALIASES
for standard_key, aliases in SMART_ALIASES.items():
    if standard_key in FIELD_KEYWORDS:
        # 合并并去重
        FIELD_KEYWORDS[standard_key] = list(set(FIELD_KEYWORDS[standard_key] + aliases))
    else:
        FIELD_KEYWORDS[standard_key] = aliases


def _clean(text: str) -> str:
    """清洗列名：去括号内容、空格、特殊字符"""
    text = re.sub(r"[（(].*?[)）]", "", text)  # 去括号
    text = re.sub(r"\s+", "", text)             # 去空格
    return text.lower()


def match_column(col_name: str) -> tuple[str, float] | None:
    """
    匹配列名到目标字段

    返回: (field_key, score) 或 None
    score 范围 0.0 ~ 1.0
    """
    cleaned = _clean(col_name)
    if not cleaned:
        return None

    best_key, best_score = None, 0.0

    for key, keywords in FIELD_KEYWORDS.items():
        for kw in keywords:
            kw_clean = _clean(kw)
            if not kw_clean:
                continue

            # 精确包含匹配 — 分数与关键词长度成正比（长词优先）
            if kw_clean in cleaned or cleaned in kw_clean:
                score = 0.7 + min(len(kw_clean) * 0.05, 0.25)  # 2字=0.8, 4字=0.9, 6字=0.95
            # 单字符匹配必须完整词匹配
            elif len(kw_clean) >= 2 and all(c in cleaned for c in kw_clean):
                score = 0.5 + min(len(kw_clean) * 0.03, 0.15)
            else:
                continue

            if score > best_score:
                best_score = score
                best_key = key

    if best_score >= 0.5:
        return (best_key, best_score)
    return None


def match_columns(headers: list[str]) -> dict[str, str]:
    """
    批量匹配列名

    返回: { 原始列名: 目标字段键 }
    未匹配的列名不会出现在结果中
    """
    result = {}
    for h in headers:
        m = match_column(h)
        if m:
            result[h] = m[0]
    return result


# ── Sheet 名关键词 ────────────────────────────
# 合并原有规则与 mappings.py 中的 Sheet 列表
SHEET_KEYWORDS = {
    "overviewData": ["汇总", "概览", "总览", "经营", "P4", "overview", "summary"],
    "expenseBreakdown": ["费用", "支出", "开支", "P6", "expense"],
    "departmentData": ["部门", "事业部", "分部", "P5", "dept"],
    "bizCustomerTop10": ["客户", "买方", "P10", "customer"],
    "bizProductTop10": ["产品", "商品", "品类", "P10", "product"],
    "productCategoryData": ["category"],
    "onlineSalesData": ["线上", "电商", "平台", "P13", "online"],
    "arData": ["应收", "AR", "P15", "receivable"],
    "apData": ["应付", "AP", "P16", "payable"],
    "arByPerson": ["业务员", "销售员", "P17", "person"],
    "inventoryProduct": ["库存", "存货", "P20", "inventory"],
    "inventorySupplier": ["供应商", "P21", "supplier"],
    "freightByChannel": ["运费", "物流", "快递", "P23", "freight"],
    "freightOverview": ["运费总", "P23"],
}

# 动态同步 mappings.py 中的 sheet 列表到关键词中
from .mappings import OVERVIEW, EXPENSE, DEPARTMENTS, BIZ_CUSTOMER_TOP10, BIZ_PRODUCT_TOP10, KEY_CUSTOMER, ONLINE_SALES, AR_AGING, AR_TOP10, AP_AGING_DIST, AP_TOP10, AR_BY_PERSON, INVENTORY_PRODUCT_REMAINING, INVENTORY_PRODUCT_IN_STOCK, INVENTORY_PRODUCT_TOP10, INVENTORY_SUPPLIER_TOP10, FREIGHT_CHANNEL

MODULE_MAP = {
    "overviewData": OVERVIEW,
    "expenseBreakdown": EXPENSE,
    "departmentData": DEPARTMENTS,
    "bizCustomerTop10": BIZ_CUSTOMER_TOP10,
    "bizProductTop10": BIZ_PRODUCT_TOP10,
    "onlineSalesData": ONLINE_SALES,
    "arData": AR_AGING,
    "apData": AP_AGING_DIST,
    "arByPerson": AR_BY_PERSON,
    "inventoryProduct": INVENTORY_PRODUCT_REMAINING,
    "inventorySupplier": INVENTORY_SUPPLIER_TOP10,
    "freightByChannel": FREIGHT_CHANNEL,
}

for key, config in MODULE_MAP.items():
    if "sheet" in config:
        sheets = config["sheet"] if isinstance(config["sheet"], list) else [config["sheet"]]
        if key in SHEET_KEYWORDS:
            SHEET_KEYWORDS[key] = list(set(SHEET_KEYWORDS[key] + sheets))
        else:
            SHEET_KEYWORDS[key] = sheets


def match_sheet(name: str) -> tuple[str, float] | None:
    """匹配 Sheet 名到数据键"""
    cleaned = _clean(name)
    if not cleaned:
        return None
    best_key, best_score = None, 0.0
    for key, keywords in SHEET_KEYWORDS.items():
        for kw in keywords:
            kw_clean = _clean(kw)
            if not kw_clean:
                continue
            if kw_clean in cleaned or cleaned in kw_clean:
                score = 0.9
            elif all(c in cleaned for c in kw_clean) and len(kw_clean) >= 2:
                score = 0.6
            else:
                continue
            if score > best_score:
                best_score = score
                best_key = key
    if best_score >= 0.5:
        return (best_key, best_score)
    return None


def match_report(headers: list[str]) -> dict:
    """生成匹配报告"""
    matched = {}
    unmatched = []
    for h in headers:
        m = match_column(h)
        if m:
            matched[h] = {"field": m[0], "score": round(m[1], 2)}
        else:
            unmatched.append(h)
    return {"matched": matched, "unmatched": unmatched, "total": len(headers)}
