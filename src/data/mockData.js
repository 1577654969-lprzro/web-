// Mock data extracted from 数据.xlsx (至远药业2026年4月经营数据)
// All monetary values in 万元 (ten-thousands RMB)

export const overviewData = {
  month: "2026年4月",
  // P4: Budget vs Actual (月度)
  budgetVsActual: {
    revenue: { actual: 3291.16, budget: 4820.24, rate: 68.28 },
    grossProfit: { actual: 86.96, budget: 155.55, rate: 55.90 },
    expense: { actual: 153.47, budget: 175.13, rate: 87.63 },
    netProfit: { actual: -80.55, budget: -43.01, rate: 187.29 },
  },
  // P4: YoY comparison (月度)
  yoy: {
    revenue: { actual: 3291.16, yoy: 3805.56, rate: 86.48 },
    grossProfit: { actual: 86.96, yoy: 3700.69, rate: 2.35 },
    expense: { actual: 153.47, yoy: 135.86, rate: 112.97 },
    netProfit: { actual: -80.55, yoy: -48.82, rate: 164.99 },
  },
  // Cumulative
  cumulative: {
    revenue: { actual: 3291.16, budget: 14341.43, rate: 22.95 },
    grossProfit: { actual: 86.96, budget: 438.99, rate: 19.81 },
    expense: { actual: 153.47, budget: 512.47, rate: 29.95 },
  },
};

// P6: Expense breakdown (万元)
export const expenseBreakdown = [
  { category: "租金", amount202604: 8.26, amount202504: 18.34 },
  { category: "水电", amount202604: 1.77, amount202504: 2.57 },
  { category: "平台费", amount202604: 29.85, amount202504: 25.04 },
  { category: "快递/供应链", amount202604: 34.24, amount202504: 31.87 },
  { category: "人工薪酬", amount202604: 55.78, amount202504: 46.80 },
  { category: "业务招待", amount202604: 1.71, amount202504: 0.37 },
  { category: "其他费用", amount202604: 12.77, amount202504: 14.73 },
];

// P5: Department-level revenue & gross profit
export const departmentData = [
  {
    dept: "经营部",
    revenue202604: 1272.97,
    revenue202504: 1076.85,
    revenueChange: 18.21,
    grossProfit202604: 59.55,
    grossProfit202504: 50.64,
    grossProfitRate202604: 4.68,
    grossProfitRate202504: 4.70,
    marginShare: 1.82,
  },
  {
    dept: "平台运营",
    revenue202604: 465.88,
    revenue202504: 346.30,
    revenueChange: 34.53,
    grossProfit202604: 9.81,
    grossProfit202504: 8.42,
    grossProfitRate202604: 2.11,
    grossProfitRate202504: 2.43,
    marginShare: 0.30,
  },
  {
    dept: "C端电商",
    revenue202604: 59.04,
    revenue202504: 15.43,
    revenueChange: 282.68,
    grossProfit202604: 0.89,
    grossProfit202504: 3.39,
    grossProfitRate202604: 1.52,
    grossProfitRate202504: 21.97,
    marginShare: 0.03,
  },
  {
    dept: "事业部",
    revenue202604: 1482.34,
    revenue202504: 2355.27,
    revenueChange: -37.06,
    grossProfit202604: 14.35,
    grossProfit202504: 40.06,
    grossProfitRate202604: 0.97,
    grossProfitRate202504: 1.70,
    marginShare: 0.44,
  },
  {
    dept: "线上销售",
    revenue202604: 10.91,
    revenue202504: 11.72,
    revenueChange: -6.87,
    grossProfit202604: 2.35,
    grossProfit202504: 2.35,
    grossProfitRate202604: 21.55,
    grossProfitRate202504: 20.09,
    marginShare: 0.07,
  },
];

// P10: 事业部 customer analysis (top 10)
export const bizCustomerTop10 = [
  { name: "广东某医药发展有限公司", revenue: 93.51, share: 8.73, grossRate: 3.16, gpShare: 0.28 },
  { name: "某医药通药业有限公司", revenue: 81.70, share: 7.62, grossRate: -0.24, gpShare: -0.02 },
  { name: "某某某医药有限公司", revenue: 52.86, share: 4.93, grossRate: 0.08, gpShare: 0.00 },
  { name: "石家庄某医药药材有限公司", revenue: 45.11, share: 4.21, grossRate: 0.75, gpShare: 0.03 },
  { name: "河北某医药有限公司", revenue: 37.58, share: 3.51, grossRate: 0.46, gpShare: 0.02 },
  { name: "河北医某医药有限公司", revenue: 37.39, share: 3.49, grossRate: 1.11, gpShare: 0.04 },
  { name: "某市为某医药有限公司", revenue: 36.14, share: 3.37, grossRate: 1.98, gpShare: 0.07 },
  { name: "河北某优医药有限公司", revenue: 35.71, share: 3.33, grossRate: 0.95, gpShare: 0.03 },
  { name: "河北圣某医药贸易有限公司", revenue: 30.44, share: 2.84, grossRate: 0.99, gpShare: 0.03 },
  { name: "河北某泰医药有限公司", revenue: 27.22, share: 2.54, grossRate: -1.59, gpShare: -0.04 },
];

// P10: 事业部 product top 10
export const bizProductTop10 = [
  { name: "某止咳祛痰口服溶液", revenue: 96.68, share: 9.02, grossRate: 3.15, gpShare: 0.28 },
  { name: "某易克肟颗粒/某混悬液II", revenue: 87.22, share: 8.14, grossRate: -1.39, gpShare: -0.11 },
  { name: "某地平片", revenue: 82.11, share: 7.66, grossRate: -0.55, gpShare: -0.04 },
  { name: "某氟伐他汀钠片", revenue: 67.20, share: 6.27, grossRate: 1.11, gpShare: 0.07 },
  { name: "某酸某双胍片", revenue: 53.53, share: 5.00, grossRate: 0.04, gpShare: 0.00 },
  { name: "某酮片", revenue: 44.29, share: 4.13, grossRate: -1.13, gpShare: -0.05 },
  { name: "头孢某胶囊", revenue: 35.85, share: 3.34, grossRate: -1.65, gpShare: -0.06 },
  { name: "某司某替尼片/某镁咀嚼片", revenue: 32.79, share: 3.06, grossRate: 2.71, gpShare: 0.08 },
  { name: "某神口服液", revenue: 28.66, share: 2.67, grossRate: -1.00, gpShare: -0.03 },
  { name: "某多某德片", revenue: 27.85, share: 2.60, grossRate: -0.90, gpShare: -0.02 },
];

// P11: 产品发展部 (摇钱树/钱串子/瘦狗 分类)
export const productCategoryData = {
  cashCow: {
    name: "摇钱树",
    revenue: 185.07,
    revenueShare: 39.5,
    grossProfit: 3.21,
    grossRate: 1.73,
    topProduct: "头孢某胶囊 0.125g*6袋",
    topRevenue: 11.32,
  },
  moneyString: {
    name: "钱串子",
    revenue: 259.69,
    revenueShare: 55.5,
    grossProfit: 4.23,
    grossRate: 1.63,
    topProduct: "某地黄口服液",
    topRevenue: 15.03,
  },
  skinnyDog: {
    name: "瘦狗",
    revenue: 23.37,
    revenueShare: 5.0,
    grossProfit: 0.70,
    grossRate: 2.98,
    topProduct: "某有效霉素(某平)",
    topRevenue: 2.54,
  },
};

// P12: 大客户部 data
export const keyCustomerData = {
  totalRevenue: 410.64,
  totalGrossRate: 0.43,
  top10: [
    { name: "某山市某医药贸易有限公司", revenue: 305.68, share: 74.44, grossRate: 2.50 },
    { name: "广东某医药发展有限公司", revenue: 25.33, share: 6.17, grossRate: -17.44 },
    { name: "广东某药业有限公司", revenue: 17.14, share: 4.17, grossRate: 3.54 },
    { name: "广东某源药业股份有限公司", revenue: 12.76, share: 3.11, grossRate: -25.67 },
    { name: "广东某华药业有限公司", revenue: 6.49, share: 1.58, grossRate: 11.18 },
    { name: "广东某药业有限公司", revenue: 5.38, share: 1.31, grossRate: 8.46 },
    { name: "广东某医药有限公司", revenue: 4.71, share: 1.15, grossRate: -4.44 },
    { name: "广东某药业有限公司", revenue: 4.10, share: 1.00, grossRate: -3.68 },
    { name: "某某市某药业有限公司", revenue: 3.84, share: 0.94, grossRate: 43.75 },
    { name: "某市某药业有限公司", revenue: 3.84, share: 0.94, grossRate: 43.75 },
  ],
  strategy: {
    issue: "前十大客户占收入94.8%，其中佛山某客户占74.4%，客户高度集中",
    action: "开拓新客户市场，目标是前5大客户占比降至50%以下",
  },
};

// P13: 线上销售部
export const onlineSalesData = [
  { channel: "京东-某大药房旗舰店", revenue: 6.46, cost: 5.42, grossProfit: 1.04, platformFee: 0.52, netRate: 4.91 },
  { channel: "天猫-某大药房旗舰店", revenue: 7.80, cost: 6.99, grossProfit: 0.80, platformFee: 0.05, netRate: 3.84 },
  { channel: "拼多多-某大药房旗舰店", revenue: 24.19, cost: 21.97, grossProfit: 2.22, platformFee: 0.37, netRate: 7.22 },
  { channel: "拼多多-某药某大药房旗舰店", revenue: 3.01, cost: 2.55, grossProfit: 0.46, platformFee: 0.04, netRate: 13.20 },
  { channel: "抖音-至远某大药房旗舰店", revenue: 15.15, cost: 13.50, grossProfit: 1.65, platformFee: 0.97, netRate: -2.64 },
];

// P15: 应收分析 AR
export const arData = {
  totalAR: 3291.76,
  arByDept: [
    { dept: "大客户部", ar30: 116.13, ar3060: 471.98, ar60180: 65.92, ar180360: 0, ar360p: 0, total: 654.04, share: 19.87 },
    { dept: "线上门店部", ar30: 46.86, ar3060: 58.45, ar60180: 154.55, ar180360: 18.63, ar360p: 22.11, total: 300.61, share: 9.13 },
    { dept: "产品发展部", ar30: 0, ar3060: 0, ar60180: 0, ar180360: 4.79, ar360p: 19.11, total: 23.91, share: 0.73 },
    { dept: "事业部", ar30: 341.02, ar3060: 251.59, ar60180: 1429.33, ar180360: 20.80, ar360p: 270.47, total: 2313.21, share: 70.27 },
  ],
  top10Customers: [
    { name: "某某医药有限公司", amount: 1479.05, share: 44.93 },
    { name: "某山市某医药贸易有限公司", amount: 305.68, share: 9.29 },
    { name: "广东某药业有限公司", amount: 275.37, share: 8.37 },
    { name: "广东某医药发展有限公司", amount: 107.61, share: 3.27 },
    { name: "某市某医药有限公司", amount: 92.80, share: 2.82 },
    { name: "广东某医药贸易有限公司", amount: 88.82, share: 2.70 },
    { name: "广东某药业有限公司", amount: 41.76, share: 1.27 },
    { name: "浙江某医药有限公司", amount: 36.25, share: 1.10 },
    { name: "某市某医药有限公司", amount: 35.10, share: 1.07 },
    { name: "河北某泰医药有限公司", amount: 27.22, share: 0.83 },
  ],
};

// P16: 应付分析 AP
export const apData = {
  totalAP: 2475.36,
  apByDept: [
    { dept: "C端采购部", ap30: 7.32, ap3060: 43.74, ap60180: 7.09, ap180360: 5.15, ap360p: 15.10, total: 78.39 },
    { dept: "线上销售部", ap30: 0, ap3060: 0, ap60180: 0, ap180360: 0, ap360p: 6.55, total: 6.55 },
    { dept: "产品发展部", ap30: 0, ap3060: 1.46, ap60180: 0, ap180360: 0, ap360p: 76.90, total: 78.36 },
    { dept: "事业采购部", ap30: 313.44, ap3060: 1001.82, ap60180: 367.62, ap180360: 248.14, ap360p: 381.07, total: 2312.09 },
    { dept: "经营部", ap30: 0, ap3060: 0, ap60180: -0.03, ap180360: 0, ap360p: -0.01, total: -0.04 },
  ],
  agingDistribution: [
    { bucket: "30天内", amount: 320.76, share: 12.96 },
    { bucket: "30-60天", amount: 1047.02, share: 42.30 },
    { bucket: "60-180天", amount: 374.68, share: 15.14 },
    { bucket: "180-360天", amount: 253.28, share: 10.23 },
    { bucket: "360天以上", amount: 479.62, share: 19.38 },
  ],
  top10Suppliers: [
    { name: "广东某药业有限公司", amount: 243.40 },
    { name: "某药控股某贸易有限公司", amount: 204.67 },
    { name: "广东省某药材某药业有限公司", amount: 168.47 },
    { name: "某药控股广东某有限公司", amount: 153.04 },
    { name: "某某广东医药有限公司", amount: 144.98 },
    { name: "某药业股份有限公司", amount: 96.36 },
    { name: "广东某新药业有限公司", amount: 93.99 },
    { name: "某药控股某山有限公司", amount: 91.37 },
    { name: "某市某医药(广东)有限公司", amount: 80.48 },
    { name: "广东某医药发展有限公司", amount: 75.28 },
  ],
};

// P17: AR by salesperson
export const arByPerson = [
  { name: "某颖怡", totalAR: 0.00, collected: 0.00, remaining: 0.00 },
  { name: "某小丽", totalAR: 55.04, collected: 46.40, remaining: 8.64 },
  { name: "某佳璇", totalAR: 134.80, collected: 100.80, remaining: 34.00 },
  { name: "某煜婷", totalAR: 25.37, collected: 6.82, remaining: 18.55 },
  { name: "某芝", totalAR: 51.35, collected: 41.90, remaining: 9.45 },
  { name: "某海燕", totalAR: 394.21, collected: 81.51, remaining: 312.70 },
  { name: "某彩苑", totalAR: 21.64, collected: 4.21, remaining: 17.43 },
  { name: "某绮雯", totalAR: 310.66, collected: 60.16, remaining: 250.50 },
  { name: "某晓莹", totalAR: 37.29, collected: 16.55, remaining: 20.74 },
  { name: "某晓君", totalAR: 126.18, collected: 66.58, remaining: 59.60 },
  { name: "某骏威", totalAR: 211.75, collected: 193.52, remaining: 18.23 },
];

// P20: 库存分析 - 产品
export const inventoryProduct = {
  remainingStock: [
    { bucket: "<90天", amount: 0.00, share: 0.00 },
    { bucket: "90-180天", amount: 1.58, share: 0.16 },
    { bucket: "180-360天", amount: 31.67, share: 3.12 },
    { bucket: "360天以上", amount: 981.45, share: 96.72 },
    { total: 1014.70 },
  ],
  inStockAging: [
    { bucket: "<30天", amount: 354.00, share: 34.89 },
    { bucket: "30-60天", amount: 264.87, share: 26.10 },
    { bucket: "60-90天", amount: 170.80, share: 16.83 },
    { bucket: "90天以上", amount: 225.03, share: 22.18 },
    { total: 1014.70 },
  ],
  top10Products: [
    { name: "某氨基酸注射液(18AA)", amount: 58.81, agingDays: 360 },
    { name: "某通便宝片", amount: 35.76, agingDays: 360 },
    { name: "某伐他汀钙片", amount: 33.44, agingDays: 360 },
    { name: "某泰松片", amount: 29.22, agingDays: 360 },
    { name: "某儿清肺颗粒", amount: 20.55, agingDays: 360 },
    { name: "某坦胶囊", amount: 18.45, agingDays: 360 },
    { name: "某胃消食片", amount: 17.81, agingDays: 360 },
    { name: "某金果梅片", amount: 15.98, agingDays: 360 },
    { name: "某口服液", amount: 15.23, agingDays: 360 },
    { name: "某多莫德片", amount: 14.42, agingDays: 360 },
  ],
};

// P21: 库存分析 - 供应商
export const inventorySupplier = {
  totalStock: 2248.13,
  remainingStock: [
    { bucket: "<90天", amount: 0.00, share: 0.00 },
    { bucket: "90-180天", amount: 132.68, share: 5.90 },
    { bucket: "180-360天", amount: 175.11, share: 7.79 },
    { bucket: "360天以上", amount: 1940.34, share: 86.31 },
  ],
  top10Suppliers: [
    { name: "武汉某医药有限公司", amount: 1233.45, share: 54.87 },
    { name: "某药控股广东某有限公司", amount: 203.17, share: 9.04 },
    { name: "广东某药业有限公司", amount: 88.90, share: 3.95 },
    { name: "某某市某药股份有限公司", amount: 58.81, share: 2.62 },
    { name: "某市某医药有限公司", amount: 50.42, share: 2.24 },
    { name: "某药控股某山有限公司", amount: 30.48, share: 1.36 },
    { name: "某市某医药有限公司", amount: 23.79, share: 1.06 },
    { name: "广东某医药发展有限公司", amount: 20.07, share: 0.89 },
    { name: "某市某药业有限公司", amount: 17.19, share: 0.76 },
    { name: "广东某药业有限公司", amount: 15.87, share: 0.71 },
  ],
  supplierConcentration: 77.5, // top 10 supplier share %
};

// P23: 运费总览
export const freightOverview = {
  totalFreight: 41.60,
  lastMonthFreight: 50.79,
  momChange: -9.19,
  totalValue: 3920.47,
  lastMonthValue: 3702.33,
  totalTickets: 20906,
  lastMonthTickets: 26925,
  feeRatio: 1.11,
  lastMonthFeeRatio: 1.37,
};

// P23/P24: 运费渠道明细
export const freightByChannel = [
  { channel: "韵达", freight: 2.12, momFreight: 5.33, tickets: 42, momTickets: 131, avgPerTicket: 505.71, momAvgPerTicket: 406.69, avgValue: 116242.67, feeRatio: 0.44 },
  { channel: "极兔", freight: 0, momFreight: 0, tickets: 0, momTickets: 0, avgPerTicket: 0, momAvgPerTicket: 0, avgValue: 0, feeRatio: 0 },
  { channel: "中通", freight: 28.55, momFreight: 0.41, tickets: 13494, momTickets: 128, avgPerTicket: 21.16, momAvgPerTicket: 32.23, avgValue: 837.95, feeRatio: 2.52 },
  { channel: "跨越", freight: 0, momFreight: 0.17, tickets: 0, momTickets: 3, avgPerTicket: 0, momAvgPerTicket: 576.56, avgValue: 0, feeRatio: 0 },
  { channel: "京东", freight: 0, momFreight: 0.23, tickets: 0, momTickets: 22, avgPerTicket: 0, momAvgPerTicket: 105.02, avgValue: 0, feeRatio: 0 },
  { channel: "普通", freight: 0, momFreight: 1.94, tickets: 0, momTickets: 6823, avgPerTicket: 0, momAvgPerTicket: 2.84, avgValue: 0, feeRatio: 0 },
  { channel: "顺丰", freight: 0, momFreight: 0, tickets: 0, momTickets: 0, avgPerTicket: 0, momAvgPerTicket: 0, avgValue: 0, feeRatio: 0 },
  { channel: "圆通", freight: 0.97, momFreight: 3.67, tickets: 28, momTickets: 235, avgPerTicket: 347.05, momAvgPerTicket: 156.12, avgValue: 27398.75, feeRatio: 1.27 },
];
