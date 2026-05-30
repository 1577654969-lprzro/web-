"""
Excel 解析器 — 独立封装

优先 calamine (Rust 引擎, ~5x 快), 回退 openpyxl
"""

import json
import sys
from pathlib import Path
from typing import Any


def read_excel(filepath: str | Path) -> dict[str, list[dict[str, Any]]]:
    """读取 Excel 全部 Sheet → {sheet_name: [{col: val}]}"""
    path = str(filepath)

    # 优先 calamine
    try:
        from python_calamine import CalamineWorkbook
        wb = CalamineWorkbook.from_path(path)
        result = {}
        for name in wb.sheet_names:
            rows = wb.get_sheet_by_name(name).to_python()
            if not rows:
                result[name] = []
                continue
            headers = [str(h).strip() if h else f"col_{i}" for i, h in enumerate(rows[0])]
            ncols = len(headers)
            data = []
            for row in rows[1:]:
                if not row or all(v is None for v in row):
                    continue
                record = {}
                for i in range(min(len(row), ncols)):
                    if row[i] is not None:
                        record[headers[i]] = row[i]
                if record:
                    data.append(record)
            result[name] = data
        return result
    except ImportError:
        pass

    # 回退 openpyxl
    import openpyxl
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    result = {}
    for name in wb.sheetnames:
        ws = wb[name]
        rows_iter = ws.iter_rows(values_only=True)
        try:
            headers_row = next(rows_iter)
        except StopIteration:
            result[name] = []
            continue
        headers = [str(h).strip() if h else f"col_{i}" for i, h in enumerate(headers_row)]
        ncols = len(headers)
        data = []
        for row in rows_iter:
            if not row or all(v is None for v in row):
                continue
            record = {}
            for i in range(min(len(row), ncols)):
                if row[i] is not None:
                    record[headers[i]] = row[i]
            if record:
                data.append(record)
        result[name] = data
    wb.close()
    return result


def main():
    if len(sys.argv) < 2:
        print("用法: python -m file_parser.excel_reader <Excel文件路径>")
        sys.exit(1)
    path = sys.argv[1]
    if not Path(path).exists():
        print(f"文件不存在: {path}")
        sys.exit(1)
    data = read_excel(path)
    print(json.dumps({k: f"{len(v)} 行" for k, v in data.items()}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
