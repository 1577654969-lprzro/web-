"""
Excel Sheet → Frontend JSON 映射配置
每个映射定义：源 sheet、列映射、输出结构

修改此文件即可适配不同 Excel 布局，无需改动转换引擎。
"""

# ── 经营概览 ──────────────────────────────────
OVERVIEW = {
    "sheet": "P4",
    "fields": {
        "revenue_actual": ("收入_实际", float),
        "revenue_budget": ("收入_预算", float),
        "revenue_rate": ("收入_达成率", float),
        "gp_actual": ("毛利_实际", float),
        "gp_budget": ("毛利_预算", float),
        "gp_rate": ("毛利_达成率", float),
        "expense_actual": ("费用_实际", float),
        "expense_budget": ("费用_预算", float),
        "expense_rate": ("费用_使用率", float),
        "revenue_yoy": ("收入_同比", float),
        "revenue_yoy_rate": ("收入_同比率", float),
        "revenue_cum_budget": ("收入_累计预算", float),
        "revenue_cum_rate": ("收入_累计达成率", float),
        "expense_cum_budget": ("费用_累计预算", float),
        "expense_cum_rate": ("费用_累计使用率", float),
    },
}

EXPENSE = {
    "sheet": "P6",
    "key_field": "category",
    "fields": {
        "category": ("费用类别", str),
        "amount202604": ("2026年4月", float),
        "amount202504": ("2025年4月", float),
    },
}

DEPARTMENTS = {
    "sheet": "P5",
    "key_field": "dept",
    "fields": {
        "dept": ("部门", str),
        "revenue202604": ("收入_202604", float),
        "revenue202504": ("收入_202504", float),
        "revenueChange": ("收入_环比变化", float),
        "grossProfit202604": ("毛利额_202604", float),
        "grossProfit202504": ("毛利额_202504", float),
        "grossProfitRate202604": ("毛利率_202604", float),
        "grossProfitRate202504": ("毛利率_202504", float),
        "marginShare": ("边际贡献率", float),
    },
}

# ── 销售分析 ──────────────────────────────────
BIZ_CUSTOMER_TOP10 = {
    "sheet": "P10",
    "key_field": "name",
    "fields": {
        "name": ("客户名称", str),
        "revenue": ("含税收入", float),
        "share": ("收入占比", float),
        "grossRate": ("毛利率", float),
    },
}

BIZ_PRODUCT_TOP10 = {
    "sheet": "P10",
    "key_field": "name",
    "start_row": 14,  # 产品表从第14行开始
    "fields": {
        "name": ("产品名称", str),
        "revenue": ("含税收入", float),
        "share": ("收入占比", float),
        "grossRate": ("毛利率", float),
    },
}

KEY_CUSTOMER = {
    "sheet": "P12",
    "key_field": "name",
    "fields": {
        "name": ("客户名称", str),
        "revenue": ("收入", float),
        "share": ("占比", float),
        "grossRate": ("毛利率", float),
    },
}

ONLINE_SALES = {
    "sheet": "P13",
    "key_field": "channel",
    "fields": {
        "channel": ("渠道", str),
        "revenue": ("收入", float),
        "cost": ("成本", float),
        "grossProfit": ("毛利", float),
        "platformFee": ("平台费", float),
        "netRate": ("净利润率", float),
    },
}

# ── 应收应付 ──────────────────────────────────
AR_AGING = {
    "sheet": "P15",
    "key_field": "dept",
    "fields": {
        "dept": ("部门", str),
        "ar30": ("30天内", float),
        "ar3060": ("30-60天", float),
        "ar60180": ("60-180天", float),
        "ar180360": ("180-360天", float),
        "ar360p": ("360天以上", float),
    },
}

AR_TOP10 = {
    "sheet": "P15",
    "key_field": "name",
    "start_row": 8,
    "fields": {
        "name": ("客户名称", str),
        "amount": ("金额", float),
        "share": ("占比", float),
    },
}

AP_AGING_DIST = {
    "sheet": "P16",
    "key_field": "bucket",
    "fields": {
        "bucket": ("账龄段", str),
        "amount": ("金额", float),
        "share": ("占比", float),
    },
}

AP_TOP10 = {
    "sheet": "P16",
    "key_field": "name",
    "start_row": 10,
    "fields": {
        "name": ("供应商名称", str),
        "amount": ("金额", float),
    },
}

AR_BY_PERSON = {
    "sheet": "P17",
    "key_field": "name",
    "fields": {
        "name": ("业务员", str),
        "totalAR": ("应收总额", float),
        "collected": ("已收", float),
        "remaining": ("剩余应收", float),
    },
}

# ── 库存分析 ──────────────────────────────────
INVENTORY_PRODUCT_REMAINING = {
    "sheet": "P20",
    "key_field": "bucket",
    "fields": {
        "bucket": ("库龄段", str),
        "amount": ("金额", float),
        "share": ("占比", float),
    },
}

INVENTORY_PRODUCT_IN_STOCK = {
    "sheet": "P20",
    "key_field": "bucket",
    "start_row": 8,
    "fields": {
        "bucket": ("库龄段", str),
        "amount": ("金额", float),
        "share": ("占比", float),
    },
}

INVENTORY_PRODUCT_TOP10 = {
    "sheet": "P20",
    "key_field": "name",
    "start_row": 14,
    "fields": {
        "name": ("产品名称", str),
        "amount": ("金额", float),
        "agingDays": ("库龄天数", int),
    },
}

INVENTORY_SUPPLIER_TOP10 = {
    "sheet": "P21",
    "key_field": "name",
    "fields": {
        "name": ("供应商名称", str),
        "amount": ("金额", float),
        "share": ("占比", float),
    },
}

# ── 运费分析 ──────────────────────────────────
FREIGHT_CHANNEL = {
    "sheet": "P23",
    "key_field": "channel",
    "fields": {
        "channel": ("快递渠道", str),
        "freight": ("本月运费", float),
        "tickets": ("本月票数", int),
        "avgPerTicket": ("本月每票运费", float),
        "feeRatio": ("本月费比", float),
    },
}
