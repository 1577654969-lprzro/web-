"""
CSV Sheet → Frontend JSON 映射配置
严格按照 Data Schema 标准定义，绝不臆造任何字段。
"""

# ── 智能别名映射 (仅用于增强兼容性) ──────────────────
SMART_ALIASES = {
    "project": ["项目", "Project", "Item"],
    "revenue_actual": ["收入_实际", "实际收入", "本月收入", "营收_实际", "Revenue_Actual"],
    "revenue_budget": ["收入_预算", "预算收入", "目标收入", "Revenue_Budget"],
    "revenue_rate": ["收入_达成率", "达成率", "完成率", "Revenue_Rate"],
    "gp_actual": ["毛利_实际", "实际毛利", "毛利额", "GrossProfit_Actual"],
    "gp_budget": ["毛利_预算", "预算毛利", "GrossProfit_Budget"],
    "gp_rate": ["毛利_达成率", "毛利率", "GP_Rate"],
    "expense_actual": ["费用_实际", "实际费用", "本月支出", "Expense_Actual"],
    "expense_budget": ["费用_预算", "预算费用", "Expense_Budget"],
    "expense_rate": ["费用_使用率", "费用率", "Expense_Rate"],
    "profit_actual": ["利润_实际", "实际利润", "Profit_Actual"],
    "profit_budget": ["利润_预算", "预算利润", "Profit_Budget"],
    
    "dept": ["部门", "事业部", "经营部", "Dept", "Department"],
    "channel": ["渠道", "快递渠道", "平台", "Channel"],
    "name": ["客户名称", "产品名称", "名称", "供应商名称", "Name"],
    "amount": ["金额", "库存金额", "应收金额", "Amount"],
    "share": ["占比", "收入占比", "百分比", "Share"],
}

# ── 1. 经营核心总表 (P4.csv) ─────────────────────────────
P4_OVERVIEW = {
    "sheet": ["P4"],
    "type": "overview",
    "budget_vs_actual": {
        "project_field": "项目",
        "metrics": {
            "revenue": {
                "actual": "实际（当月）",
                "budget": "预算（当月）",
                "monthly_rate": "当月达成率",
                "cum_actual": "累计（当季）",
                "cum_budget": "预算（当季）",
                "cum_rate": "当季达成率",
            },
            "grossProfit": {
                "actual": "实际（当月）",
                "budget": "预算（当月）",
                "monthly_rate": "当月达成率",
                "cum_actual": "累计（当季）",
                "cum_budget": "预算（当季）",
                "cum_rate": "当季达成率",
            },
            "expense": {
                "actual": "实际（当月）",
                "budget": "预算（当月）",
                "monthly_rate": "当月达成率",
                "cum_actual": "累计（当季）",
                "cum_budget": "预算（当季）",
                "cum_rate": "当季达成率",
            },
            "netProfit": {
                "actual": "实际（当月）",
                "budget": "预算（当月）",
                "monthly_rate": "当月达成率",
                "cum_actual": "累计（当季）",
                "cum_budget": "预算（当季）",
                "cum_rate": "当季达成率",
            },
        },
        "project_keywords": {
            "revenue": ["收入", "营收"],
            "grossProfit": ["毛利", "毛利额"],
            "expense": ["费用", "支出"],
            "netProfit": ["利润", "净利润"],
        }
    },
    "yoy": {
        "project_field": "项目",
        "metrics": {
            "revenue": {
                "actual": "实际（当月）",
                "yoy": "同比（当月）",
                "monthly_rate": "当月达成率",
                "cum_actual": "累计（当季）",
                "cum_yoy": "同比（当季）",
                "cum_rate": "当季达成率",
            },
            "grossProfit": {
                "actual": "实际（当月）",
                "yoy": "同比（当月）",
                "monthly_rate": "当月达成率",
                "cum_actual": "累计（当季）",
                "cum_yoy": "同比（当季）",
                "cum_rate": "当季达成率",
            },
            "expense": {
                "actual": "实际（当月）",
                "yoy": "同比（当月）",
                "monthly_rate": "当月达成率",
                "cum_actual": "累计（当季）",
                "cum_yoy": "同比（当季）",
                "cum_rate": "当季达成率",
            },
            "netProfit": {
                "actual": "实际（当月）",
                "yoy": "同比（当月）",
                "monthly_rate": "当月达成率",
                "cum_actual": "累计（当季）",
                "cum_yoy": "同比（当季）",
                "cum_rate": "当季达成率",
            },
        }
    }
}

# ── 2. 销售渠道与边际贡献表 (P5.csv) ──────────────────────
P5_CHANNELS = {
    "sheet": ["P5"],
    "type": "channels",
    "channels": [
        "线上销售", "平台自营", "C端电商", "线下销售", "联营销售", "合计"
    ],
    "metrics": ["收入", "毛利", "毛利率", "边际贡献"],
    "periods": ["202604", "202504", "对比"],
}

# ── 3. 费用明细表 (P6.csv) ────────────────────────────────
P6_EXPENSE = {
    "sheet": ["P6"],
    "type": "expense",
    "categories": [
        "租金", "水电", "平台费", "物流供应链", "人工薪酬", "差旅招待", "其他费用"
    ],
    "amount_fields": {
        "202604": "202604金额",
        "202504": "202504金额",
    },
}

# ── 4. 客户与商品排行贡献表 (P10.csv) ─────────────────────
P10_CUSTOMER_PRODUCT = {
    "sheet": ["P10"],
    "type": "ranking",
    "customer": {
        "core_customers": [
            "广东金安", "湖北药商通", "陕西铭铖", "石家庄极正",
            "河北康云", "河北医霖", "湖北诚为上", "河北利康德",
            "河北圣邦", "河北国泰"
        ],
        "metrics": ["含税收入", "销售占比", "毛利率", "毛利贡献"],
    },
    "product": {
        "core_products": [
            "(倍他乐克)琥珀酸美托洛尔缓释片",
            "(信必可都保)布地奈德福莫特罗吸入粉雾剂（II）",
            "(补佳乐)戊酸雌二醇片",
            "(可定)瑞舒伐他汀钙片",
            "(格华止)盐酸二甲双胍片",
            "(达芙通)地屈孕酮片",
            "(希刻劳)头孢克洛干混悬剂",
            "(耐信)艾司奥美拉唑镁肠溶片",
            "(艾纳香)咽立爽口含滴丸",
            "(科达琳)复方氨酚肾素片",
        ],
        "metrics": ["含税收入", "销售占比", "毛利率", "毛利贡献"],
    },
}

# ── 5. 店铺盈利明细表 (P13.csv) ──────────────────────────
P13_STORES = {
    "sheet": ["P13"],
    "type": "stores",
    "stores": [
        "京东-仁医扁鹊大药房旗舰店",
        "天猫-仁医扁鹊大药房旗舰店",
        "拼多多-苗倾城大药房旗舰店",
        "拼多多-至药云大药房旗舰店",
        "美团-至远大药房旗舰店",
        "合计"
    ],
    "metrics": [
        "收入", "成本", "毛利", "平台费（固定扣点）", "其他", "店铺利润", "利润率"
    ],
}

# ── 6. 应收账款账龄分析表 (P15.csv) ───────────────────────
P15_AR_AGING = {
    "sheet": ["P15"],
    "type": "ar_aging",
    "aging_buckets": [
        "30天内", "30-60天", "60-180天", "180-360天", "360天以上", "总计", "占比"
    ],
    "departments": [
        "大客户部", "连锁门店部", "商品拓展部", "商业部"
    ],
    "core_customers": [
        "广州誉乾", "佛山大参林", "广东和嵘", "广东金安",
        "江西仁海", "广东邦健", "广东百康", "浙江乐药",
        "陕西伟业", "河北国泰"
    ],
}

# ── 兼容旧版 Excel 映射 (保持向后兼容) ─────────────────────
OVERVIEW = {
    "sheet": ["P4", "经营概览", "概览"],
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
    "sheet": ["P6", "费用明细", "费用分析"],
    "key_field": "category",
    "fields": {
        "category": ("费用类别", str),
        "amount202604": ("2026年4月", float),
        "amount202504": ("2025年4月", float),
    },
}

DEPARTMENTS = {
    "sheet": ["P5", "分部门", "部门经营"],
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
    "sheet": ["P10", "客户分析", "Top客户"],
    "key_field": "name",
    "fields": {
        "name": ("客户名称", str),
        "revenue": ("含税收入", float),
        "share": ("收入占比", float),
        "grossRate": ("毛利率", float),
    },
}

BIZ_PRODUCT_TOP10 = {
    "sheet": ["P10", "产品分析", "Top产品"],
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
    "sheet": ["P12", "大客户", "核心客户"],
    "key_field": "name",
    "fields": {
        "name": ("客户名称", str),
        "revenue": ("收入", float),
        "share": ("占比", float),
        "grossRate": ("毛利率", float),
    },
}

ONLINE_SALES = {
    "sheet": ["P13", "线上销售", "电商分析"],
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
    "sheet": ["P15", "应收账龄", "AR"],
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
    "sheet": ["P15", "应收客户", "AR排名"],
    "key_field": "name",
    "start_row": 8,
    "fields": {
        "name": ("客户名称", str),
        "amount": ("金额", float),
        "share": ("占比", float),
    },
}

AP_AGING_DIST = {
    "sheet": ["P16", "应付账龄", "AP"],
    "key_field": "bucket",
    "fields": {
        "bucket": ("账龄段", str),
        "amount": ("金额", float),
        "share": ("占比", float),
    },
}

AP_TOP10 = {
    "sheet": ["P16", "应付供应商", "AP排名"],
    "key_field": "name",
    "start_row": 10,
    "fields": {
        "name": ("供应商名称", str),
        "amount": ("金额", float),
    },
}

AR_BY_PERSON = {
    "sheet": ["P17", "业务员回款", "回款分析"],
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
    "sheet": ["P20", "库存概览", "库存分析"],
    "key_field": "bucket",
    "fields": {
        "bucket": ("库龄段", str),
        "amount": ("金额", float),
        "share": ("占比", float),
    },
}

INVENTORY_PRODUCT_IN_STOCK = {
    "sheet": ["P20", "在库库存", "库存明细"],
    "key_field": "bucket",
    "start_row": 8,
    "fields": {
        "bucket": ("库龄段", str),
        "amount": ("金额", float),
        "share": ("占比", float),
    },
}

INVENTORY_PRODUCT_TOP10 = {
    "sheet": ["P20", "产品库存排名", "Top产品库存"],
    "key_field": "name",
    "start_row": 14,
    "fields": {
        "name": ("产品名称", str),
        "amount": ("金额", float),
        "agingDays": ("库龄天数", int),
    },
}

INVENTORY_SUPPLIER_TOP10 = {
    "sheet": ["P21", "供应商库存", "Top供应商库存"],
    "key_field": "name",
    "fields": {
        "name": ("供应商名称", str),
        "amount": ("金额", float),
        "share": ("占比", float),
    },
}

# ── 运费分析 ──────────────────────────────────
FREIGHT_CHANNEL = {
    "sheet": ["P23", "运费分析", "物流费比"],
    "key_field": "channel",
    "fields": {
        "channel": ("快递渠道", str),
        "freight": ("本月运费", float),
        "tickets": ("本月票数", int),
        "avgPerTicket": ("本月每票运费", float),
        "feeRatio": ("本月费比", float),
    },
}

