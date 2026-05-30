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

# 关键词配置：{ 目标键: [关键词列表] }
FIELD_KEYWORDS = {
    # 收入相关
    "revenue": ["收入", "营收", "销售额", "含税收入", "不含税收入", "revenue", "sales"],
    "revenue_budget": ["收入预算", "预算收入", "目标收入"],
    "revenue_change": ["收入环比", "收入变化", "收入变动", "环比变化"],
    "revenue_yoy": ["收入同比", "同比收入", "去年同期收入"],
    "revenue_rate": ["收入达成率", "预算达成率", "收入完成率"],

    # 毛利相关
    "gross_profit": ["毛利", "毛利额", "gross profit"],
    "gp_rate": ["毛利率", "毛利达成率", "margin"],
    "gp_budget": ["毛利预算", "目标毛利"],

    # 费用相关
    "expense": ["费用", "支出", "花费"],
    "expense_budget": ["费用预算", "预算费用"],
    "expense_rate": ["费用使用率", "费用占比"],

    # 客户/产品
    "customer": ["客户", "买方", "采购方"],
    "product": ["产品", "商品", "品名"],
    "share": ["占比", "份额", "比重", "share", "%"],
    "gross_rate": ["毛利率", "利润率", "gross rate"],

    # 应收应付
    "ar_amount": ["应收", "应收账款", "AR"],
    "ap_amount": ["应付", "应付账款", "AP"],
    "overdue": ["逾期", "超期", "拖欠"],
    "aging_30": ["30天", "30天内", "<30"],
    "aging_3060": ["30-60", "30到60", "3060"],
    "aging_60180": ["60-180", "60到180"],
    "aging_180360": ["180-360", "180到360"],
    "aging_360p": ["360天", "一年以上", "超一年", "360以上"],

    # 库存
    "inventory": ["库存", "存货", "stock"],
    "aging_days": ["库龄", "库存天数", "aging"],

    # 运费
    "freight": ["运费", "物流费", "快递费"],
    "tickets": ["票数", "订单数", "tickets"],
    "fee_ratio": ["费比", "费率", "费用率"],
    "avg_per_ticket": ["每票运费", "票均", "平均运费"],
    "avg_value": ["每票货值", "票均货值"],

    # 通用
    "date": ["日期", "月份", "时间"],
    "dept": ["部门", "事业部", "板块", "dept"],
    "channel": ["渠道", "平台", "channel"],
    "amount": ["金额", "万元", "amount"],
    "name": ["名称", "名字", "name"],
    "rate": ["率", "%", "rate", "ratio"],
}


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
SHEET_KEYWORDS = {
    "overviewData": ["汇总", "概览", "总览", "经营", "P4", "overview", "summary"],
    "expenseBreakdown": ["费用", "支出", "开支", "P6", "expense"],
    "departmentData": ["部门", "事业部", "分部", "P5", "dept"],
    "bizCustomerTop10": ["客户", "买方", "P10", "customer"],
    "bizProductTop10": ["产品", "商品", "品类", "P10", "product"],
    "productCategoryData": ["摇钱树", "钱串子", "瘦狗", "现金牛", "category"],
    "onlineSalesData": ["线上", "电商", "平台", "P13", "online"],
    "arData": ["应收", "AR", "P15", "receivable"],
    "apData": ["应付", "AP", "P16", "payable"],
    "arByPerson": ["业务员", "销售员", "P17", "person"],
    "inventoryProduct": ["库存", "存货", "P20", "inventory"],
    "inventorySupplier": ["供应商", "P21", "supplier"],
    "freightByChannel": ["运费", "物流", "快递", "P23", "freight"],
    "freightOverview": ["运费总", "P23"],
}


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
