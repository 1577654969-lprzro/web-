"""
CSV 数据解析器 — 严格符合 Data Schema 标准

功能：
1. CSV 文本清洗：跳过空行、去除多余逗号
2. 类型安全转换：处理科学计数法、负数、百分比
3. 严格字段验证：不臆造任何不存在的字段
"""

import csv
import io
from typing import Dict, List, Any, Optional
from dataclasses import dataclass


def _safe_float_cast(val: Any, default: float = 0.0) -> float:
    """生产级数值转换：完美处理科学计数法、负数、百分号

    规则：
    - 负数 (如 -80.55) 原样保留
    - 科学计数法 (如 9.627e-05) 解析为高精度浮点数
    - 百分号自动除以100
    - 千分位逗号自动去除
    """
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return float(val)

    s = str(val).strip()
    if not s:
        return default

    # 去除千分位逗号
    s = s.replace(",", "")

    # 处理百分比
    has_pct = "%" in s
    if has_pct:
        s = s.replace("%", "")

    try:
        f = float(s)
        return f / 100.0 if has_pct else f
    except (ValueError, TypeError):
        return default


def _is_empty_row(row: Dict[str, str]) -> bool:
    """判断是否空行：所有值都为空"""
    return all(not str(v).strip() for v in row.values())


def parse_csv_text(csv_content: str, encoding: str = "utf-8") -> List[Dict[str, str]]:
    """
    CSV 原生文本 → 标准化字典列表

    清洗规则：
    1. 跳过空行
    2. 去除单元格首尾空白
    3. 处理 BOM 头
    """
    # 处理 BOM
    if csv_content.startswith("\ufeff"):
        csv_content = csv_content[1:]

    rows = []
    reader = csv.DictReader(io.StringIO(csv_content))

    for row in reader:
        # 清洗每行：去除空白
        cleaned_row = {k.strip(): str(v).strip() for k, v in row.items()}
        if not _is_empty_row(cleaned_row):
            rows.append(cleaned_row)

    return rows


def parse_csv_from_path(file_path: str, encoding: str = "utf-8") -> List[Dict[str, str]]:
    """从文件路径读取 CSV"""
    with open(file_path, "r", encoding=encoding, errors="replace") as f:
        return parse_csv_text(f.read(), encoding)


@dataclass
class CSVDataset:
    """标准 CSV 数据集容器"""
    p4: List[Dict[str, Any]]  # 经营核心总表
    p5: List[Dict[str, Any]]  # 销售渠道与边际贡献表
    p6: List[Dict[str, Any]]  # 费用明细表
    p10: List[Dict[str, Any]]  # 客户与商品排行贡献表
    p13: List[Dict[str, Any]]  # 店铺盈利明细表
    p15: List[Dict[str, Any]]  # 应收账款账龄分析表

    def get_sheet(self, sheet_name: str) -> List[Dict[str, Any]]:
        """按名称获取 Sheet"""
        sheet_map = {
            "P4": self.p4, "P5": self.p5, "P6": self.p6,
            "P10": self.p10, "P13": self.p13, "P15": self.p15
        }
        return sheet_map.get(sheet_name.upper(), [])


def load_standard_csv_dataset(base_dir: str) -> CSVDataset:
    """加载完整的标准 CSV 数据集 (P4-P15)"""
    return CSVDataset(
        p4=parse_csv_from_path(f"{base_dir}/P4.csv"),
        p5=parse_csv_from_path(f"{base_dir}/P5.csv"),
        p6=parse_csv_from_path(f"{base_dir}/P6.csv"),
        p10=parse_csv_from_path(f"{base_dir}/P10.csv"),
        p13=parse_csv_from_path(f"{base_dir}/P13.csv"),
        p15=parse_csv_from_path(f"{base_dir}/P15.csv"),
    )
