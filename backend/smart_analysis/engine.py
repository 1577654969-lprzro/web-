"""
智能分析引擎 — 独立封装

零 Web 依赖，纯规则引擎。
输入数据字典 + 问题文本，输出结构化分析结果。

命令行: python -m smart_analysis.engine --data '{"grossMargin":3}' --question "毛利率"
"""

import json
import sys
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class AnalysisResult:
    diagnosis: str
    evidence: list[str] = field(default_factory=list)
    suggestions: list[str] = field(default_factory=list)
    severity: str = "info"  # info | warning | critical


# ── 规则注册表 ──────────────────────────────────

_RULES: list[dict] = []


def register(match_patterns: list[str]):
    """装饰器：注册分析规则，match_patterns 为触发关键词列表"""

    def decorator(fn):
        _RULES.append({"keywords": match_patterns, "fn": fn})
        return fn

    return decorator


# ── 具体规则 ────────────────────────────────────

@register(["毛利", "利润", "盈利"])
def check_gross_margin(data: dict) -> Optional[AnalysisResult]:
    rate = data.get("grossMargin")
    if rate is None:
        return None
    if rate > 20:
        return None
    sev = "critical" if rate < 5 else "warning"
    return AnalysisResult(
        diagnosis=f"当前毛利率仅 {rate:.2f}%，处于{'危险' if rate < 5 else '偏低'}水平",
        evidence=[f"毛利率：{rate:.2f}%", "行业健康线：>20%"],
        suggestions=["审查低毛利产品线，考虑提价或淘汰", "优化采购成本，与供应商重新谈判", "调整产品结构，增加高毛利品类占比"],
        severity=sev,
    )


@register(["库存", "库龄", "积压", "滞销"])
def check_inventory_aging(data: dict) -> Optional[AnalysisResult]:
    over360 = data.get("agingOver360")
    if over360 is None:
        return None
    if over360 < 30:
        return None
    sev = "critical" if over360 > 60 else "warning"
    return AnalysisResult(
        diagnosis=f"超360天库龄占比 {over360:.1f}%，库存严重老化",
        evidence=[f"超360天库存占比：{over360:.1f}%", f"超90天库龄产品：{data.get('agingOver90Amount', '—')} 万元", "健康标准：<30%"],
        suggestions=["对超龄库存专项清理（折价、退货、报损）", "建立库存周转预警机制", "对滞销品设置采购限额"],
        severity=sev,
    )


@register(["应收", "回款", "逾期", "坏账"])
def check_ar_overdue(data: dict) -> Optional[AnalysisResult]:
    overdue = data.get("overdueAR")
    total = data.get("totalAR", 1)
    if overdue is None:
        return None
    ratio = (overdue / total) * 100
    if ratio < 10:
        return None
    sev = "critical" if ratio > 30 else "warning"
    return AnalysisResult(
        diagnosis=f"逾期应收 {overdue:.0f} 万元，占总应收 {ratio:.1f}%",
        evidence=[f"逾期未回款：{overdue:.0f} 万元", f"逾期占比：{ratio:.1f}%", f"超一年应收：{data.get('overYearAR', '—')} 万元"],
        suggestions=["对逾期客户分级催收，重点关注大额逾期", "收紧信用政策，新客户要求预付款", "评估坏账风险，必要时计提准备"],
        severity=sev,
    )


@register(["运费", "物流", "费比"])
def check_freight_ratio(data: dict) -> Optional[AnalysisResult]:
    ratio = data.get("feeRatio")
    if ratio is None:
        return None
    if ratio < 1:
        return None
    sev = "critical" if ratio > 3 else "warning" if ratio > 1.5 else "info"
    return AnalysisResult(
        diagnosis=f"运费费比 {ratio:.2f}%，{'超出合理范围' if ratio > 1.5 else '需持续关注'}",
        evidence=[f"本月费比：{ratio:.2f}%", f"每票运费：{data.get('avgPerTicket', '—')} 元", "合理范围：<1.5%"],
        suggestions=["对比渠道运费，优化渠道结构", "提高每票货值，摊薄运费成本", "与快递商谈判争取量价优惠"],
        severity=sev,
    )


@register(["集中", "依赖", "风险"])
def check_concentration(data: dict) -> Optional[AnalysisResult]:
    share = data.get("top10Share")
    if share is None or share < 50:
        return None
    label = data.get("concentrationLabel", "客户")
    sev = "critical" if share > 80 else "warning"
    return AnalysisResult(
        diagnosis=f"前十大{label}集中度 {share:.1f}%，存在集中风险",
        evidence=[f"前十大占比：{share:.1f}%", "头部集中度过高，单一客户波动影响大"],
        suggestions=["拓展新客户/供应商，降低集中度", "与大客户签订长期协议", "建立客户流失预警机制"],
        severity=sev,
    )


@register(["预算", "达成", "目标", "KPI"])
def check_budget(data: dict) -> Optional[AnalysisResult]:
    rate = data.get("budgetRate")
    if rate is None or rate > 90:
        return None
    sev = "critical" if rate < 70 else "warning"
    return AnalysisResult(
        diagnosis=f"预算达成率仅 {rate:.1f}%，落后于时间进度",
        evidence=[f"预算达成率：{rate:.1f}%", f"实际收入：{data.get('actualRevenue', '—')} 万元", f"预算目标：{data.get('budgetRevenue', '—')} 万元"],
        suggestions=["分析落后原因（市场/产品/客户维度）", "制定追赶计划，明确责任人和时间节点", "必要时调整下半年预算目标"],
        severity=sev,
    )


@register(["综合", "总体", "全局", "总结"])
def general_summary(data: dict) -> AnalysisResult:
    findings = []

    rate = data.get("grossMargin")
    if rate is not None and rate < 10:
        findings.append(f"毛利率 {rate:.2f}% 偏低")

    aging = data.get("agingOver360")
    if aging is not None and aging > 40:
        findings.append(f"超360天库存占比 {aging:.1f}% 过高")

    overdue = data.get("overdueAR")
    total = data.get("totalAR")
    if overdue is not None and total is not None:
        ar_ratio = (overdue / total) * 100
        if ar_ratio > 20:
            findings.append(f"逾期应收占比 {ar_ratio:.1f}% 需关注")

    fee = data.get("feeRatio")
    if fee is not None and fee > 1.5:
        findings.append(f"运费费比 {fee:.2f}% 偏高")

    if not findings:
        return AnalysisResult(
            diagnosis="当前经营数据总体健康，未发现显著风险项。",
            evidence=["各项指标均在合理范围内"],
            suggestions=["持续监控关键指标变化趋势", "关注行业动态和竞争格局"],
        )

    return AnalysisResult(
        diagnosis=f"综合评估发现 {len(findings)} 个需关注的风险点",
        evidence=findings,
        suggestions=["优先处理严重程度最高的风险项", "建立定期经营分析会议机制", "完善数据采集和监控体系"],
        severity="critical" if len(findings) > 2 else "warning",
    )


# ── 对外接口 ────────────────────────────────────

def analyze(data: dict, question: str) -> dict:
    """主分析函数：输入数据 + 问题，返回结构化分析结果"""
    q_lower = question.lower()

    for rule in _RULES:
        if any(kw in q_lower for kw in rule["keywords"]):
            result = rule["fn"](data)
            if result:
                return {
                    "diagnosis": result.diagnosis,
                    "evidence": result.evidence,
                    "suggestions": result.suggestions,
                    "severity": result.severity,
                }

    # 无匹配规则时回退到综合分析
    result = general_summary(data)
    return {
        "diagnosis": result.diagnosis,
        "evidence": result.evidence,
        "suggestions": result.suggestions,
        "severity": result.severity,
    }


# ── CLI 入口 ────────────────────────────────────

def main():
    import argparse

    parser = argparse.ArgumentParser(description="智能分析引擎")
    parser.add_argument("--data", type=str, default="{}", help="JSON 格式的输入数据")
    parser.add_argument("--question", type=str, default="综合", help="分析问题")
    args = parser.parse_args()

    data = json.loads(args.data)
    result = analyze(data, args.question)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
