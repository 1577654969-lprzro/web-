"""
Word 文档解析器 — 独立封装

仅依赖 python-docx，可脱离 Web 框架运行。
命令行: python -m file_parser.docx_reader <文件路径>
"""

import json
import sys
from pathlib import Path
from typing import Any

from docx import Document


def read_docx(filepath: str | Path) -> dict[str, Any]:
    """
    读取 .docx 文件，返回 { paragraphs: [...], tables: [[{col: val}]], metadata: {...} }
    """
    doc = Document(str(filepath))

    paragraphs: list[str] = []
    for p in doc.paragraphs:
        text = p.text.strip()
        if text:
            paragraphs.append(text)

    tables: list[list[dict[str, Any]]] = []
    for table in doc.tables:
        rows = []
        if not table.rows:
            continue
        headers = [cell.text.strip() or f"col_{i}" for i, cell in enumerate(table.rows[0].cells)]
        for row in table.rows[1:]:
            cells = [cell.text.strip() for cell in row.cells]
            if all(not c for c in cells):
                continue
            record = {}
            for i, val in enumerate(cells):
                if i < len(headers):
                    record[headers[i]] = val
            if record:
                rows.append(record)
        if rows:
            tables.append(rows)

    return {
        "paragraphs": paragraphs,
        "tables": tables,
        "paragraph_count": len(paragraphs),
        "table_count": len(tables),
    }


def main():
    if len(sys.argv) < 2:
        print("用法: python -m file_parser.docx_reader <docx文件路径>")
        sys.exit(1)

    path = sys.argv[1]
    if not Path(path).exists():
        print(f"文件不存在: {path}")
        sys.exit(1)

    data = read_docx(path)
    print(f"段落: {data['paragraph_count']} 段")
    print(f"表格: {data['table_count']} 个")
    for i, t in enumerate(data["tables"]):
        print(f"  表格{i+1}: {len(t)} 行, 列: {list(t[0].keys())[:6] if t else '无'}")


if __name__ == "__main__":
    main()
