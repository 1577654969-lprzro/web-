"""
数据推送接口适配层
用于向看板前端推送标准化 JSON 数据
"""

from typing import Dict, Any, Optional
import json
from dataclasses import dataclass, asdict


@dataclass
class PushDataRequest:
    """标准推送请求结构"""
    data: Dict[str, Any]
    month: str
    version: str
    metadata: Optional[Dict[str, Any]] = None

    def to_json(self) -> str:
        """序列化为 JSON 字符串"""
        return json.dumps(asdict(self), ensure_ascii=False)

    @classmethod
    def from_transformed_data(cls, data: Dict[str, Any], month: str = "202604", version: str = "5.0.0"):
        """从转换后的数据构建推送请求"""
        return cls(
            data=data,
            month=month,
            version=version,
            metadata={
                "source": "csv_parser",
                "timestamp": None
            }
        )


def build_push_payload(data: Dict[str, Any], month: str = "202604", version: str = "5.0.0") -> Dict[str, Any]:
    """
    构建完整的推送载荷

    顶层索引说明：
    - month: 按月份索引，方便前端历史查询
    - version: 数据版本，便于回滚
    - data: 完整看板数据
    """
    return {
        "month": month,
        "version": version,
        "data": data,
        "schema": {
            "overviewData": ["month", "budgetVsActual", "yoy", "cumulative"],
            "expenseBreakdown": ["category", "amount202604", "amount202504"],
            "departmentData": ["dept", "revenue202604", "grossProfitRate202604"],
            "bizCustomerTop10": ["name", "revenue", "share", "grossRate"],
            "bizProductTop10": ["name", "revenue", "share", "grossRate"],
            "onlineSalesData": ["channel", "revenue", "grossProfit", "netRate"],
            "arData": ["totalAR", "arByDept", "top10Customers"],
        }
    }


def validate_push_payload(payload: Dict[str, Any]) -> bool:
    """校验推送载荷完整性"""
    required_fields = ["month", "version", "data"]
    return all(field in payload for field in required_fields)


def print_push_example(data: Dict[str, Any]):
    """打印推送示例（调试用）"""
    req = PushDataRequest.from_transformed_data(data)
    print("=" * 80)
    print("📦 看板数据推送示例")
    print("=" * 80)
    print(f"Month: {req.month}")
    print(f"Version: {req.version}")
    print("\n" + "=" * 80)
    print("📋 核心指标")
    print("=" * 80)

    overview = data.get("overviewData", {})
    bva = overview.get("budgetVsActual", {})

    print(f"收入 (实际/预算): {bva.get('revenue', {}).get('actual', 0)} / {bva.get('revenue', {}).get('budget', 0)}")
    print(f"毛利 (实际/预算): {bva.get('grossProfit', {}).get('actual', 0)} / {bva.get('grossProfit', {}).get('budget', 0)}")
    print(f"费用 (实际/预算): {bva.get('expense', {}).get('actual', 0)} / {bva.get('expense', {}).get('budget', 0)}")

    print("\n" + "=" * 80)
    print("POST 请求 Body 结构")
    print("=" * 80)
    print(json.dumps(build_push_payload(data), ensure_ascii=False, indent=2))
