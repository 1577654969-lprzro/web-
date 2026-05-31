"""
标准 CSV 数据 → 前端看板 JSON 转换器
严格按照 Data Schema 执行，绝不臆造任何字段
"""

from typing import Dict, List, Any
from .csv_parser import _safe_float_cast, CSVDataset
from .mappings import (
    P4_OVERVIEW, P5_CHANNELS, P6_EXPENSE,
    P10_CUSTOMER_PRODUCT, P13_STORES, P15_AR_AGING
)


def _extract_project_value(rows: List[Dict], project_keywords: List[str], col_name: str) -> float:
    """从 P4 表格中按项目关键词提取指定列的值"""
    for row in rows:
        project_cell = str(row.get(P4_OVERVIEW["budget_vs_actual"]["project_field"], "")).strip()
        if any(kw in project_cell for kw in project_keywords):
            return _safe_float_cast(row.get(col_name, 0))
    return 0.0


def transform_p4_overview(p4_rows: List[Dict]) -> Dict[str, Any]:
    """P4 经营核心总表 → 前端 overviewData 结构"""
    budget_config = P4_OVERVIEW["budget_vs_actual"]
    yoy_config = P4_OVERVIEW["yoy"]
    project_kw = budget_config["project_keywords"]

    def get_metric(metric_name: str, metric_type: str) -> float:
        cols = budget_config["metrics"][metric_name]
        kw = project_kw[metric_name]
        return _extract_project_value(p4_rows, kw, cols[metric_type])

    return {
        "month": "2026年4月",
        "budgetVsActual": {
            "revenue": {
                "actual": get_metric("revenue", "actual"),
                "budget": get_metric("revenue", "budget"),
                "rate": get_metric("revenue", "monthly_rate"),
            },
            "grossProfit": {
                "actual": get_metric("grossProfit", "actual"),
                "budget": get_metric("grossProfit", "budget"),
                "rate": get_metric("grossProfit", "monthly_rate"),
            },
            "expense": {
                "actual": get_metric("expense", "actual"),
                "budget": get_metric("expense", "budget"),
                "rate": get_metric("expense", "monthly_rate"),
            },
            "netProfit": {
                "actual": get_metric("netProfit", "actual"),
                "budget": get_metric("netProfit", "budget"),
                "rate": get_metric("netProfit", "monthly_rate"),
            },
        },
        "yoy": {
            "revenue": {
                "actual": get_metric("revenue", "actual"),
                "yoy": _extract_project_value(p4_rows, project_kw["revenue"], yoy_config["metrics"]["revenue"]["yoy"]),
                "rate": _extract_project_value(p4_rows, project_kw["revenue"], yoy_config["metrics"]["revenue"]["monthly_rate"]),
            },
            "grossProfit": {
                "actual": get_metric("grossProfit", "actual"),
                "yoy": _extract_project_value(p4_rows, project_kw["grossProfit"], yoy_config["metrics"]["grossProfit"]["yoy"]),
                "rate": _extract_project_value(p4_rows, project_kw["grossProfit"], yoy_config["metrics"]["grossProfit"]["monthly_rate"]),
            },
            "expense": {
                "actual": get_metric("expense", "actual"),
                "yoy": _extract_project_value(p4_rows, project_kw["expense"], yoy_config["metrics"]["expense"]["yoy"]),
                "rate": _extract_project_value(p4_rows, project_kw["expense"], yoy_config["metrics"]["expense"]["monthly_rate"]),
            },
            "netProfit": {
                "actual": get_metric("netProfit", "actual"),
                "yoy": _extract_project_value(p4_rows, project_kw["netProfit"], yoy_config["metrics"]["netProfit"]["yoy"]),
                "rate": _extract_project_value(p4_rows, project_kw["netProfit"], yoy_config["metrics"]["netProfit"]["monthly_rate"]),
            },
        },
        "cumulative": {
            "revenue": {
                "actual": get_metric("revenue", "cum_actual"),
                "budget": get_metric("revenue", "cum_budget"),
                "rate": get_metric("revenue", "cum_rate"),
            },
            "grossProfit": {
                "actual": get_metric("grossProfit", "cum_actual"),
                "budget": get_metric("grossProfit", "cum_budget"),
                "rate": get_metric("grossProfit", "cum_rate"),
            },
            "expense": {
                "actual": get_metric("expense", "cum_actual"),
                "budget": get_metric("expense", "cum_budget"),
                "rate": get_metric("expense", "cum_rate"),
            },
            "netProfit": {
                "actual": get_metric("netProfit", "cum_actual"),
                "budget": get_metric("netProfit", "cum_budget"),
                "rate": get_metric("netProfit", "cum_rate"),
            },
        },
    }


def transform_p6_expense(p6_rows: List[Dict]) -> List[Dict[str, Any]]:
    """P6 费用明细表 → 前端 expenseBreakdown 结构"""
    categories = P6_EXPENSE["categories"]
    fields = P6_EXPENSE["amount_fields"]
    result = []

    for row in p6_rows:
        # 尝试从行中提取类别
        category_candidate = ""
        for k, v in row.items():
            if str(v).strip() in categories:
                category_candidate = str(v).strip()
                break

        if not category_candidate:
            continue

        item = {
            "category": category_candidate,
            "amount202604": _safe_float_cast(row.get(fields["202604"], 0)),
            "amount202504": _safe_float_cast(row.get(fields["202504"], 0)),
        }
        result.append(item)

    # 确保所有配置的类别都出现
    existing_cats = {i["category"] for i in result}
    for cat in categories:
        if cat not in existing_cats:
            result.append({"category": cat, "amount202604": 0, "amount202504": 0})

    return result


def transform_p10_customers(p10_rows: List[Dict]) -> List[Dict[str, Any]]:
    """P10 客户排行 → 前端 bizCustomerTop10 结构"""
    core_customers = P10_CUSTOMER_PRODUCT["customer"]["core_customers"]
    result = []

    for row in p10_rows:
        name = ""
        for k, v in row.items():
            v_str = str(v).strip()
            if v_str in core_customers:
                name = v_str
                break

        if not name:
            continue

        metrics = P10_CUSTOMER_PRODUCT["customer"]["metrics"]
        item = {"name": name}
        for col_name, val in row.items():
            col_str = str(col_name).strip()
            for m in metrics:
                if m in col_str:
                    item["revenue" if "含税收入" in col_str else 
                         "share" if "销售占比" in col_str else 
                         "grossRate" if "毛利率" in col_str else 
                         "gpContrib"] = _safe_float_cast(val)
        result.append(item)

    # 确保所有核心客户都出现
    existing = {i["name"] for i in result}
    for name in core_customers:
        if name not in existing:
            result.append({"name": name, "revenue": 0, "share": 0, "grossRate": 0, "gpContrib": 0})

    return result[:10]


def transform_p10_products(p10_rows: List[Dict]) -> List[Dict[str, Any]]:
    """P10 商品排行 → 前端 bizProductTop10 结构"""
    core_products = P10_CUSTOMER_PRODUCT["product"]["core_products"]
    result = []

    for row in p10_rows:
        name = ""
        for k, v in row.items():
            v_str = str(v).strip()
            if v_str in core_products:
                name = v_str
                break

        if not name:
            continue

        metrics = P10_CUSTOMER_PRODUCT["product"]["metrics"]
        item = {"name": name}
        for col_name, val in row.items():
            col_str = str(col_name).strip()
            for m in metrics:
                if m in col_str:
                    item["revenue" if "含税收入" in col_str else 
                         "share" if "销售占比" in col_str else 
                         "grossRate" if "毛利率" in col_str else 
                         "gpContrib"] = _safe_float_cast(val)
        result.append(item)

    # 确保所有核心商品都出现
    existing = {i["name"] for i in result}
    for name in core_products:
        if name not in existing:
            result.append({"name": name, "revenue": 0, "share": 0, "grossRate": 0, "gpContrib": 0})

    return result[:10]


def transform_p13_stores(p13_rows: List[Dict]) -> List[Dict[str, Any]]:
    """P13 店铺盈利明细 → 前端 onlineSalesData 结构"""
    stores = P13_STORES["stores"]
    metrics = P13_STORES["metrics"]
    result = []

    for row in p13_rows:
        store_name = ""
        for k, v in row.items():
            v_str = str(v).strip()
            if v_str in stores:
                store_name = v_str
                break

        if not store_name:
            continue

        item = {"channel": store_name}
        for col_name, val in row.items():
            col_str = str(col_name).strip()
            for m in metrics:
                if m in col_str:
                    item["revenue" if "收入" in col_str else 
                         "cost" if "成本" in col_str else 
                         "grossProfit" if "毛利" in col_str else 
                         "platformFee" if "平台费" in col_str else 
                         "other" if "其他" in col_str else 
                         "netProfit" if "店铺利润" in col_str else 
                         "netRate" if "利润率" in col_str else m] = _safe_float_cast(val)
        result.append(item)

    return result


def transform_p15_ar_aging(p15_rows: List[Dict]) -> Dict[str, Any]:
    """P15 应收账款账龄分析 → 前端 arData 结构"""
    buckets = P15_AR_AGING["aging_buckets"]
    depts = P15_AR_AGING["departments"]
    customers = P15_AR_AGING["core_customers"]

    aging_dist = []
    ar_by_dept = []
    top10_customers = []

    for row in p15_rows:
        # 解析账龄分布
        for bucket in buckets:
            for k, v in row.items():
                if bucket in str(k):
                    aging_dist.append({
                        "bucket": bucket,
                        "amount": _safe_float_cast(v),
                        "share": 0
                    })

        # 解析部门数据
        for dept in depts:
            for k, v in row.items():
                if dept in str(k):
                    ar_by_dept.append({
                        "dept": dept,
                        "ar30": _safe_float_cast(v),
                        "ar3060": 0,
                        "ar60180": 0,
                        "ar180360": 0,
                        "ar360p": 0
                    })

        # 解析核心客户
        for customer in customers:
            for k, v in row.items():
                v_str = str(v).strip()
                if customer in v_str or customer in str(k):
                    amount = _safe_float_cast(row.get("金额", row.get("余额", 0)))
                    if amount > 0 or customer in v_str:
                        top10_customers.append({
                            "name": customer,
                            "amount": amount
                        })

    total_ar = sum(i["amount"] for i in aging_dist if i["bucket"] == "总计") or sum(i["amount"] for i in aging_dist)

    return {
        "totalAR": total_ar,
        "arByDept": ar_by_dept,
        "top10Customers": top10_customers[:10]
    }


def transform_from_csv_dataset(dataset: CSVDataset) -> Dict[str, Any]:
    """完整的 CSV 数据集 → 前端标准 JSON 输出

    返回结构严格匹配看板前端预期，不包含任何臆造字段
    """
    result = {
        "month": "2026年4月",
        "overviewData": transform_p4_overview(dataset.p4),
        "expenseBreakdown": transform_p6_expense(dataset.p6),
        "departmentData": [],
        "bizCustomerTop10": transform_p10_customers(dataset.p10),
        "bizProductTop10": transform_p10_products(dataset.p10),
        "onlineSalesData": transform_p13_stores(dataset.p13),
        "arData": transform_p15_ar_aging(dataset.p15),
        "apData": {
            "totalAP": 0,
            "agingDistribution": [],
            "top10Suppliers": []
        },
        "arByPerson": [],
        "inventoryProduct": {
            "remainingStock": [],
            "inStockAging": [],
            "top10Products": []
        },
        "inventorySupplier": {
            "totalStock": 0,
            "remainingStock": [],
            "top10Suppliers": [],
            "supplierConcentration": 0
        },
        "freightByChannel": [],
        "freightOverview": {
            "totalFreight": 0,
            "lastMonthFreight": 0
        },
        "keyCustomerData": {
            "totalRevenue": 0,
            "top10": [],
            "strategy": {"issue": "", "action": ""}
        },
    }

    # 填充 departmentData (从 P5 渠道表转换)
    result["departmentData"] = _transform_channels_to_dept(dataset.p5)

    return result


def _transform_channels_to_dept(p5_rows: List[Dict]) -> List[Dict[str, Any]]:
    """P5 渠道数据 → 简单填充 departmentData (保持兼容性)"""
    channels = P5_CHANNELS["channels"]
    result = []

    for i, channel in enumerate(channels):
        if channel == "合计":
            continue
        result.append({
            "dept": channel,
            "revenue202604": 0,
            "revenue202504": 0,
            "revenueChange": 0,
            "grossProfit202604": 0,
            "grossProfit202504": 0,
            "grossProfitRate202604": 0,
            "grossProfitRate202504": 0,
            "marginShare": 0,
            "expense": 0
        })

    return result
