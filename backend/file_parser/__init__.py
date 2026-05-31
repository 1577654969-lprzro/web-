"""
数据解析与推送模块
提供 Excel/CSV → 看板 JSON 的完整转换链路
"""

from .excel_reader import read_excel
from .data_transformer import transform
from .csv_parser import (
    parse_csv_text, parse_csv_from_path,
    load_standard_csv_dataset, CSVDataset
)
from .csv_transformer import transform_from_csv_dataset
from .push_adapter import (
    PushDataRequest, build_push_payload,
    validate_push_payload, print_push_example
)

__all__ = [
    "read_excel", "transform",
    "parse_csv_text", "parse_csv_from_path",
    "load_standard_csv_dataset", "CSVDataset",
    "transform_from_csv_dataset",
    "PushDataRequest", "build_push_payload",
    "validate_push_payload", "print_push_example",
]