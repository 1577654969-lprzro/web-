/**
 * 智能分析引擎 — 独立封装，零外部依赖
 * 可直接复制到任何 JS/TS 项目使用
 *
 * 输入: (pageData, question, context)
 * 输出: { diagnosis, evidence[], suggestions[], severity }
 *
 * severity: 'info' | 'warning' | 'critical'
 */

// ── 规则定义 ──────────────────────────────────
const rules = [
  {
    id: "gross_margin_low",
    match: (q, d) => /毛利|利润|盈利/.test(q) && d.grossMargin != null,
    analyze: (d) => {
      const rate = d.grossMargin;
      if (rate > 20) return null;
      return {
        severity: rate < 5 ? "critical" : "warning",
        diagnosis: `当前毛利率仅 ${rate.toFixed(2)}%，处于${rate < 5 ? "危险" : "偏低"}水平`,
        evidence: [`毛利率：${rate.toFixed(2)}%`, `行业健康线：>20%`],
        suggestions: [
          "审查低毛利产品线，考虑提价或淘汰",
          "优化采购成本，与供应商重新谈判",
          "调整产品结构，增加高毛利品类占比",
        ],
      };
    },
  },
  {
    id: "inventory_aging",
    match: (q, d) => /库存|库龄|积压|滞销/.test(q) && d.agingOver360 != null,
    analyze: (d) => {
      const over360 = d.agingOver360;
      if (over360 < 30) return null;
      return {
        severity: over360 > 60 ? "critical" : "warning",
        diagnosis: `超360天库龄占比 ${over360.toFixed(1)}%，库存严重老化`,
        evidence: [
          `超360天库存占比：${over360.toFixed(1)}%`,
          `超90天库龄产品金额：${d.agingOver90Amount || "—"} 万元`,
          `健康标准：<30%`,
        ],
        suggestions: [
          "对超龄库存进行专项清理（折价出售、退货、报损）",
          "建立库存周转预警机制",
          "对滞销品设置采购限额",
        ],
      };
    },
  },
  {
    id: "ar_overdue",
    match: (q, d) => /应收|回款|逾期|坏账/.test(q) && d.overdueAR != null,
    analyze: (d) => {
      const overdue = d.overdueAR;
      const total = d.totalAR || 1;
      const ratio = (overdue / total) * 100;
      if (ratio < 10) return null;
      return {
        severity: ratio > 30 ? "critical" : "warning",
        diagnosis: `逾期应收 ${overdue.toFixed(0)} 万元，占总应收 ${ratio.toFixed(1)}%`,
        evidence: [
          `逾期未回款：${overdue.toFixed(0)} 万元`,
          `逾期占比：${ratio.toFixed(1)}%`,
          `超一年应收：${d.overYearAR || "—"} 万元`,
        ],
        suggestions: [
          "对逾期客户分级催收，重点关注大额逾期",
          "收紧信用政策，对新客户要求预付款",
          "评估坏账风险，必要时计提坏账准备",
        ],
      };
    },
  },
  {
    id: "freight_ratio",
    match: (q, d) => /运费|物流|费比/.test(q) && d.feeRatio != null,
    analyze: (d) => {
      const ratio = d.feeRatio;
      if (ratio < 1) return null;
      return {
        severity: ratio > 3 ? "critical" : ratio > 1.5 ? "warning" : "info",
        diagnosis: `运费费比 ${ratio.toFixed(2)}%，${ratio > 1.5 ? "超出合理范围" : "需持续关注"}`,
        evidence: [
          `本月费比：${ratio.toFixed(2)}%`,
          `每票运费：${d.avgPerTicket || "—"} 元`,
          `合理范围：<1.5%`,
        ],
        suggestions: [
          "对比各渠道运费，优化渠道结构",
          "提高每票货值，摊薄运费成本",
          "与快递商谈判争取量价优惠",
        ],
      };
    },
  },
  {
    id: "concentration_risk",
    match: (q, d) => /集中|依赖|风险/.test(q) && d.top10Share != null,
    analyze: (d) => {
      const share = d.top10Share;
      if (share < 50) return null;
      return {
        severity: share > 80 ? "critical" : "warning",
        diagnosis: `前十大${d.concentrationLabel || "客户"}集中度 ${share.toFixed(1)}%，存在集中风险`,
        evidence: [
          `前十大占比：${share.toFixed(1)}%`,
          `头部集中度过高，单一客户波动影响大`,
        ],
        suggestions: [
          "拓展新客户/供应商，降低集中度",
          "与大客户签订长期协议，稳定合作关系",
          "建立客户流失预警机制",
        ],
      };
    },
  },
  {
    id: "budget_achievement",
    match: (q, d) => /预算|达成|KPI|目标/.test(q) && d.budgetRate != null,
    analyze: (d) => {
      const rate = d.budgetRate;
      if (rate > 90) return null;
      return {
        severity: rate < 70 ? "critical" : "warning",
        diagnosis: `预算达成率仅 ${rate.toFixed(1)}%，落后于时间进度`,
        evidence: [
          `预算达成率：${rate.toFixed(1)}%`,
          `实际收入：${d.actualRevenue || "—"} 万元`,
          `预算目标：${d.budgetRevenue || "—"} 万元`,
        ],
        suggestions: [
          "分析落后原因（市场/产品/客户维度）",
          "制定追赶计划，明确责任人和时间节点",
          "必要时调整下半年预算目标",
        ],
      };
    },
  },
  {
    id: "general_summary",
    match: (q) => /综合|风险|总结|分析|概况|全部|整体/.test(q) || q.length > 5,
    analyze: (d) => {
      const findings = [];
      if (d.grossMargin != null && d.grossMargin < 10) {
        findings.push(`毛利率 ${d.grossMargin.toFixed(2)}% 偏低`);
      }
      if (d.agingOver360 != null && d.agingOver360 > 40) {
        findings.push(`超360天库存占比 ${d.agingOver360.toFixed(1)}% 过高`);
      }
      if (d.overdueAR != null && d.totalAR != null) {
        const arRatio = (d.overdueAR / d.totalAR) * 100;
        if (arRatio > 20) findings.push(`逾期应收占比 ${arRatio.toFixed(1)}% 需关注`);
      }
      if (d.feeRatio != null && d.feeRatio > 1.5) {
        findings.push(`运费费比 ${d.feeRatio.toFixed(2)}% 偏高`);
      }

      if (findings.length === 0) {
        return {
          severity: "info",
          diagnosis: "当前经营数据总体健康，未发现显著风险项。",
          evidence: ["各项指标均在合理范围内"],
          suggestions: ["持续监控关键指标变化趋势", "关注行业动态和竞争格局"],
        };
      }

      return {
        severity: findings.length > 2 ? "critical" : "warning",
        diagnosis: `综合评估发现 ${findings.length} 个需关注的风险点`,
        evidence: findings,
        suggestions: [
          "优先处理严重程度最高的风险项",
          "建立定期经营分析会议机制",
          "完善数据采集和监控体系",
        ],
      };
    },
  },
];

// ── 快捷问题列表 ─────────────────────────────
export const quickQuestions = [
  { label: "当前经营风险分析", query: "综合风险" },
  { label: "毛利率是否健康？", query: "毛利率" },
  { label: "库存积压情况如何？", query: "库存积压" },
  { label: "应收账款有风险吗？", query: "应收逾期" },
  { label: "运费是否合理？", query: "运费费比" },
  { label: "预算达成情况", query: "预算达成" },
];

// ── 主分析函数 ───────────────────────────────
export function analyze(pageData, question) {
  const q = question.trim();
  
  // 拦截过短或纯数字的无意义输入
  if (q.length < 2 || /^\d+$/.test(q)) {
    return {
      severity: "info",
      diagnosis: "抱歉，我没能理解您的意思。请尝试输入更具体的业务问题。",
      evidence: [],
      suggestions: ["尝试提问：'毛利率是否健康？'", "或者点击下方的快捷问题"],
    };
  }

  const matched = rules.find((r) => r.match(q, pageData));
  if (!matched) {
    return {
      severity: "info",
      diagnosis: "请提供更多信息，或尝试从快捷问题中选择。",
      evidence: [],
      suggestions: ["尝试询问：毛利率、库存、应收、运费、预算等话题"],
    };
  }
  const result = matched.analyze(pageData);
  if (!result) {
    return {
      severity: "info",
      diagnosis: "当前指标在正常范围内，未检测到显著风险。",
      evidence: ["各项指标表现良好"],
      suggestions: ["继续保持监控，关注趋势变化"],
    };
  }
  return result;
}
