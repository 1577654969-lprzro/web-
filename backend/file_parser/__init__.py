"""
独立封装的 Excel/PPT/Word 解析 + 数据转换模块

用法:
    from file_parser import read_excel, read_pptx, read_docx, transform
"""
from .excel_reader import read_excel
from .data_transformer import transform
from .column_matcher import match_column, match_columns, match_report
