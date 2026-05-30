"""
数据转换引擎 — 生产级实现 (High-Code)

负责：
1. 数据清洗：剔除 Excel 中的非法空行和脏数据。
2. 类型强制转换：确保数值字段始终为 float，文本字段始终为 str。
3. 结构映射：将 Excel 的 Sheet 列表转换为前端 Store 期待的树状 JSON。
"""

from typing import Any, Dict, List, Optional
from dataclasses import dataclass, asdict

from .mappings import (
    OVERVIEW, EXPENSE, DEPARTMENTS,
    BIZ_CUSTOMER_TOP10, BIZ_PRODUCT_TOP10, ONLINE_SALES,
    AR_AGING, AR_TOP10, AP_AGING_DIST, AP_TOP10, AR_BY_PERSON,
    INVENTORY_PRODUCT_REMAINING, INVENTORY_PRODUCT_IN_STOCK,
    INVENTORY_PRODUCT_TOP10, INVENTORY_SUPPLIER_TOP10,
    FREIGHT_CHANNEL,
)

def _safe_float(val: Any, default: float = 0.0) -> float:
    """生产级数值转换：处理百分号、千分位及非法字符"""
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return float(val)
    
    s = str(val).strip().replace(",", "").replace("%", "")
    try:
        # 处理百分比
        is_pct = "%" in str(val)
        f = float(s)
        return f / 100.0 if is_pct else f
    except (ValueError, TypeError):
        return default

def _clean_row(row: Dict[str, Any], fields_map: Dict[str, tuple]) -> Dict[str, Any]:
    """根据定义过滤并转换单行数据"""
    cleaned = {}
    is_empty = True
    
    for target_key, (source_col, coerce_func) in fields_map.items():
        raw_val = row.get(source_col)
        if raw_val is not None and str(raw_val).strip():
            is_empty = False
            
        if coerce_func in (int, float):
            cleaned[target_key] = _safe_float(raw_val)
        else:
            cleaned[target_key] = str(raw_val).strip() if raw_val is not None else ""
            
    return cleaned if not is_empty else None

def transform(raw_data: Dict[str, List[Dict]]) -> Dict[str, Any]:
    """
    模块化数据转换主函数
    """
    result = {}

    # 1. 经营概览解析 (P4)
    p4 = raw_data.get(OVERVIEW["sheet"], [])
    if p4:
        r = p4[0]
        def _get(k): 
            col_info = OVERVIEW["fields"].get(k)
            if not col_info: return 0.0
            return _safe_float(r.get(col_info[0]))
        
        result["overviewData"] = {
            "month": "2026年4月",
            "budgetVsActual": {
                "revenue": {"actual": _get("revenue_actual"), "budget": _get("revenue_budget"), "rate": _get("revenue_rate")},
                "grossProfit": {"actual": _get("gp_actual"), "budget": _get("gp_budget"), "rate": _get("gp_rate")},
                "expense": {"actual": _get("expense_actual"), "budget": _get("expense_budget"), "rate": _get("expense_rate")},
            },
            "yoy": {
                "revenue": {"actual": _get("revenue_actual"), "yoy": _get("revenue_yoy"), "rate": _get("revenue_yoy_rate")},
            },
            "cumulative": {
                "revenue": {"actual": _get("revenue_actual"), "budget": _get("revenue_cum_budget"), "rate": _get("revenue_cum_rate")},
                "expense": {"actual": _get("expense_actual"), "budget": _get("expense_cum_budget"), "rate": _get("expense_cum_rate")},
            }
        }

    # 2. 列表类数据通用解析
    list_mappings = [
        ("expenseBreakdown", EXPENSE),
        ("departmentData", DEPARTMENTS),
        ("bizCustomerTop10", BIZ_CUSTOMER_TOP10),
        ("bizProductTop10", BIZ_PRODUCT_TOP10),
        ("onlineSalesData", ONLINE_SALES),
        ("arByPerson", AR_BY_PERSON),
        ("freightByChannel", FREIGHT_CHANNEL),
    ]

    for store_key, config in list_mappings:
        rows = raw_data.get(config["sheet"], [])
        cleaned_rows = []
        for r in rows:
            cleaned = _clean_row(r, config["fields"])
            if cleaned:
                cleaned_rows.append(cleaned)
        result[store_key] = cleaned_rows

    # 3. 复杂嵌套结构解析
    # 应收账款
    ar_rows = raw_data.get(AR_AGING["sheet"], [])
    result["arData"] = {
        "totalAR": sum(_safe_float(r.get("余额")) for r in ar_rows if "余额" in r),
        "arByDept": [_clean_row(r, AR_AGING["fields"]) for r in ar_rows if _clean_row(r, AR_AGING["fields"])],
        "top10Customers": [_clean_row(r, AR_TOP10["fields"]) for r in raw_data.get(AR_TOP10["sheet"], [])[:10]]
    }

    # 应付账款
    ap_dist_rows = raw_data.get(AP_AGING_DIST["sheet"], [])
    result["apData"] = {
        "totalAP": sum(_safe_float(r.get("余额")) for r in ap_dist_rows if "余额" in r),
        "agingDistribution": [_clean_row(r, AP_AGING_DIST["fields"]) for r in ap_dist_rows if _clean_row(r, AP_AGING_DIST["fields"])],
        "top10Suppliers": [_clean_row(r, AP_TOP10["fields"]) for r in raw_data.get(AP_TOP10["sheet"], [])[:10]]
    }

    # 库存分析
    inv_rows = raw_data.get(INVENTORY_PRODUCT_REMAINING["sheet"], [])
    result["inventoryProduct"] = {
        "remainingStock": [_clean_row(r, INVENTORY_PRODUCT_REMAINING["fields"]) for r in inv_rows if _clean_row(r, INVENTORY_PRODUCT_REMAINING["fields"])],
        "inStockAging": [_clean_row(r, INVENTORY_PRODUCT_IN_STOCK["fields"]) for r in raw_data.get(INVENTORY_PRODUCT_IN_STOCK["sheet"], []) if _clean_row(r, INVENTORY_PRODUCT_IN_STOCK["fields"])],
        "top10Products": [_clean_row(r, INVENTORY_PRODUCT_TOP10["fields"]) for r in raw_data.get(INVENTORY_PRODUCT_TOP10["sheet"], [])[:10]]
    }

    # 供应商库存
    result["inventorySupplier"] = {
        "totalStock": sum(_safe_float(r.get("库存金额")) for r in raw_data.get(INVENTORY_SUPPLIER_TOP10["sheet"], [])),
        "top10Suppliers": [_clean_row(r, INVENTORY_SUPPLIER_TOP10["fields"]) for r in raw_data.get(INVENTORY_SUPPLIER_TOP10["sheet"], [])[:10]],
        "supplierConcentration": 0.0 # Will be calculated on frontend or here
    }

    # 校验输出结构完整性
    _validate_output(result)
    return result


EXPECTED_KEYS = [
    "overviewData", "expenseBreakdown", "departmentData",
    "bizCustomerTop10", "bizProductTop10", "onlineSalesData",
    "arData", "apData", "arByPerson",
    "inventoryProduct", "inventorySupplier",
    "freightByChannel", "freightOverview",
]


def _validate_output(data: dict):
    """校验输出结构，缺失字段自动填充空值"""
    for key in EXPECTED_KEYS:
        if key not in data:
            data[key] = {} if "Data" in key or key.endswith("Product") or key.endswith("Supplier") or key.endswith("Overview") else []
