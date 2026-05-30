"""
独立封装的智能分析模块
可直接复制到任何 Python 项目使用，不依赖 FastAPI 或数据库。

用法：
    from smart_analysis import analyze
    result = analyze(data, "毛利率是否健康？")
"""
from .engine import analyze
