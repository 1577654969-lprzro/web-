"""
数据转换引擎 — 生产级实现 (High-Code)

负责：
1. 数据清洗：剔除 Excel 中的非法空行和脏数据。
2. 类型强制转换：确保数值字段始终为 float，文本字段始终为 str。
3. 结构映射：将 Excel 的 Sheet 列表转换为前端 Store 期待的树状 JSON。
"""

from typing import Any, Dict, List, Optional
from dataclasses import dataclass, asdict

from .column_matcher import match_column as _match_col, match_sheet as _match_sheet
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
    """根据定义过滤并转换单行数据，支持 Agent 列名语义匹配"""
    cleaned = {}
    is_empty = True

    for target_key, (source_col, coerce_func) in fields_map.items():
        # 1) 精确匹配
        raw_val = row.get(source_col)

        # 2) 精确匹配失败 → Agent 语义匹配（支持前缀，如 "revenue" 匹配 "revenue_actual"）
        if raw_val is None:
            for col_name, cell_val in row.items():
                match = _match_col(str(col_name))
                if match:
                    matched_field = match[0]
                    # 完全匹配 或 前缀匹配（target_key 以 matched_field 开头）
                    if matched_field == target_key or target_key.startswith(matched_field + "_"):
                        raw_val = cell_val
                        break

        if raw_val is not None and str(raw_val).strip():
            is_empty = False

        if coerce_func in (int, float):
            cleaned[target_key] = _safe_float(raw_val)
        else:
            cleaned[target_key] = str(raw_val).strip() if raw_val is not None else ""

    return cleaned if not is_empty else None

def _find_sheet(raw_data, target_key, mapping_config):
    """Agent 方式查找 Sheet: 先精确匹配映射名, 再 Agent 匹配 Sheet 名"""
    hard_names = mapping_config["sheet"]
    if isinstance(hard_names, str):
        hard_names = [hard_names]
    
    for name in hard_names:
        if name in raw_data:
            return raw_data[name]

    # Agent sheet 匹配
    for sheet_name, rows in raw_data.items():
        m = _match_sheet(str(sheet_name))
        if m and m[0] == target_key:
            return rows
    return []


def transform(raw_data: Dict[str, List[Dict]]) -> Dict[str, Any]:
    """Agent 驱动数据转换：Sheet 名 + 列名 都自动匹配"""
    result = {}

    # 1. 经营概览 — 跳过空标题行，找第一个有实际数据的行
    p4 = _find_sheet(raw_data, "overviewData", OVERVIEW)
    if p4:
        # 找第一个 revenue_actual > 0 的行（跳过标题行）
        r = None
        for row in p4:
            raw_val = row.get(OVERVIEW["fields"]["revenue_actual"][0])
            if raw_val is None:
                # Agent fallback
                for col_name, cell_val in row.items():
                    m = _match_col(str(col_name))
                    if m and m[0] == "revenue":
                        raw_val = cell_val
                        break
            if raw_val is not None and _safe_float(raw_val) > 0:
                r = row
                break
        
        r = r or p4[0]  # fallback to first row

        def _get(k):
            col_info = OVERVIEW["fields"].get(k)
            if not col_info: return 0.0
            raw_val = r.get(col_info[0])
            if raw_val is None:
                for col_name, cell_val in r.items():
                    m = _match_col(str(col_name))
                    if m:
                        matched_field = m[0]
                        if matched_field == k or k.startswith(matched_field + "_"):
                            raw_val = cell_val
                            break
            return _safe_float(raw_val)

        result["overviewData"] = {
            "month": "2026年4月",
            "budgetVsActual": {
                "revenue": {"actual": _get("revenue_actual"), "budget": _get("revenue_budget"), "rate": _get("revenue_rate")},
                "grossProfit": {"actual": _get("gp_actual"), "budget": _get("gp_budget"), "rate": _get("gp_rate")},
                "expense": {"actual": _get("expense_actual"), "budget": _get("expense_budget"), "rate": _get("expense_rate")},
            },
            "yoy": {
                "revenue": {"actual": _get("revenue_actual"), "yoy": _get("revenue_yoy"), "rate": _get("revenue_yoy_rate")},
                "grossProfit": {"actual": _get("gp_actual"), "yoy": 0, "rate": 0},
                "expense": {"actual": _get("expense_actual"), "yoy": 0, "rate": 0},
                "netProfit": {"actual": 0, "yoy": 0, "rate": 0},
            },
            "cumulative": {
                "revenue": {"actual": _get("revenue_actual"), "budget": _get("revenue_cum_budget"), "rate": _get("revenue_cum_rate")},
                "grossProfit": {"actual": _get("gp_actual"), "budget": 0, "rate": 0},
                "expense": {"actual": _get("expense_actual"), "budget": _get("expense_cum_budget"), "rate": _get("expense_cum_rate")},
            }
        }

    # 2. 列表类数据
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
        rows = _find_sheet(raw_data, store_key, config)
        cleaned_rows = [_clean_row(r, config["fields"]) for r in rows if _clean_row(r, config["fields"])]
        result[store_key] = cleaned_rows

    # 3. 复杂嵌套
    ar_rows = _find_sheet(raw_data, "arData", AR_AGING)
    result["arData"] = {
        "totalAR": sum(_safe_float(r.get("余额")) for r in ar_rows if "余额" in r),
        "arByDept": [_clean_row(r, AR_AGING["fields"]) for r in ar_rows if _clean_row(r, AR_AGING["fields"])],
        "top10Customers": [_clean_row(r, AR_TOP10["fields"]) for r in _find_sheet(raw_data, "arData", AR_TOP10)[:10]]
    }
    ap_rows = _find_sheet(raw_data, "apData", AP_AGING_DIST)
    result["apData"] = {
        "totalAP": sum(_safe_float(r.get("余额")) for r in ap_rows if "余额" in r),
        "agingDistribution": [_clean_row(r, AP_AGING_DIST["fields"]) for r in ap_rows if _clean_row(r, AP_AGING_DIST["fields"])],
        "top10Suppliers": [_clean_row(r, AP_TOP10["fields"]) for r in _find_sheet(raw_data, "apData", AP_TOP10)[:10]]
    }
    inv_rows = _find_sheet(raw_data, "inventoryProduct", INVENTORY_PRODUCT_REMAINING)
    result["inventoryProduct"] = {
        "remainingStock": [_clean_row(r, INVENTORY_PRODUCT_REMAINING["fields"]) for r in inv_rows if _clean_row(r, INVENTORY_PRODUCT_REMAINING["fields"])],
        "inStockAging": [_clean_row(r, INVENTORY_PRODUCT_IN_STOCK["fields"]) for r in _find_sheet(raw_data, "inventoryProduct", INVENTORY_PRODUCT_IN_STOCK) if _clean_row(r, INVENTORY_PRODUCT_IN_STOCK["fields"])],
        "top10Products": [_clean_row(r, INVENTORY_PRODUCT_TOP10["fields"]) for r in _find_sheet(raw_data, "inventoryProduct", INVENTORY_PRODUCT_TOP10)[:10]]
    }
    result["inventorySupplier"] = {
        "totalStock": sum(_safe_float(r.get("库存金额")) for r in _find_sheet(raw_data, "inventorySupplier", INVENTORY_SUPPLIER_TOP10)),
        "remainingStock": [],
        "top10Suppliers": [_clean_row(r, INVENTORY_SUPPLIER_TOP10["fields"]) for r in _find_sheet(raw_data, "inventorySupplier", INVENTORY_SUPPLIER_TOP10)[:10]],
        "supplierConcentration": 0.0
    }

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
