/**
 * 统一数据 Schema 定义 (Unified Dashboard Schema)
 * 
 * 作用：
 * 1. 定义系统唯一可信的数据结构。
 * 2. 描述各模块的必填字段、类型、别名。
 * 3. 作为校验层和智能映射层的依据。
 */

export const DASHBOARD_SCHEMA = {
  // 1. 经营概览模块
  overviewData: {
    type: "object",
    required: ["budgetVsActual", "yoy", "cumulative"],
    fields: {
      budgetVsActual: {
        revenue: { actual: "number", budget: "number", rate: "number" },
        grossProfit: { actual: "number", budget: "number", rate: "number" },
        expense: { actual: "number", budget: "number", rate: "number" },
      },
      yoy: {
        revenue: { actual: "number", yoy: "number", rate: "number" },
      },
      cumulative: {
        revenue: { actual: "number", budget: "number", rate: "number" },
        expense: { actual: "number", budget: "number", rate: "number" },
      }
    },
    aliases: {
      revenue: ["收入", "营收", "销售额", "Revenue", "Sales"],
      grossProfit: ["毛利", "毛利额", "GrossProfit", "GP"],
      expense: ["费用", "支出", "成本", "Expense", "Cost"],
      actual: ["实际", "本月", "Actual"],
      budget: ["预算", "目标", "Budget", "Target"],
      rate: ["达成率", "使用率", "Rate", "Ratio"]
    }
  },

  // 2. 列表类通用配置
  departmentData: {
    type: "array",
    itemSchema: {
      dept: { type: "string", aliases: ["部门", "事业部", "Dept"] },
      revenue202604: { type: "number", aliases: ["本月收入", "收入", "Revenue"] },
      revenueChange: { type: "number", aliases: ["环比", "变动", "Change"] },
      grossProfitRate202604: { type: "number", aliases: ["毛利率", "GPRate"] },
      marginShare: { type: "number", aliases: ["边际贡献", "Margin"] }
    }
  },

  bizCustomerTop10: {
    type: "array",
    itemSchema: {
      name: { type: "string", aliases: ["客户名称", "客户", "Customer"] },
      revenue: { type: "number", aliases: ["含税收入", "收入", "Revenue"] },
      share: { type: "number", aliases: ["占比", "Share"] },
      grossRate: { type: "number", aliases: ["毛利率", "GrossRate"] }
    }
  },

  onlineSalesData: {
    type: "array",
    itemSchema: {
      channel: { type: "string", aliases: ["渠道", "平台", "Channel"] },
      revenue: { type: "number", aliases: ["收入", "Revenue"] },
      grossProfit: { type: "number", aliases: ["毛利", "GP"] },
      platformFee: { type: "number", aliases: ["平台费", "Fee"] },
      netRate: { type: "number", aliases: ["净利润率", "NetRate"] }
    }
  },

  arData: {
    type: "object",
    fields: {
      totalAR: "number",
      arByDept: "array",
      top10Customers: "array"
    },
    aliases: {
      totalAR: ["应收总额", "总应收", "TotalAR"],
      arByDept: ["部门应收", "账龄分布"],
      top10Customers: ["客户排名", "Top10客户"]
    }
  },

  inventoryProduct: {
    type: "object",
    fields: {
      remainingStock: "array",
      inStockAging: "array",
      top10Products: "array"
    }
  },

  freightByChannel: {
    type: "array",
    itemSchema: {
      channel: { type: "string", aliases: ["快递", "渠道", "Carrier"] },
      freight: { type: "number", aliases: ["运费", "金额", "Cost"] },
      tickets: { type: "number", aliases: ["票数", "数量", "Count"] },
      avgPerTicket: { type: "number", aliases: ["单票运费", "AvgCost"] },
      feeRatio: { type: "number", aliases: ["费比", "Ratio"] }
    }
  }
};
