"""
数据解析与推送完整示例
"""

from . import (
    load_standard_csv_dataset,
    transform_from_csv_dataset,
    build_push_payload,
    print_push_example
)


def example_pipeline():
    """
    完整 Pipeline 示例：CSV 解析 → 数据转换 → 推送载荷构建

    步骤：
    1. 加载 P4-P15 CSV 文件
    2. 转换为看板标准 JSON
    3. 构建推送载荷
    4. 打印预览
    """
    print("=" * 80)
    print("📊 看板数据解析与推送 Pipeline")
    print("=" * 80)

    # 步骤1：加载 CSV 数据
    print("\n[1/4] 加载 CSV 数据集...")
    dataset = load_standard_csv_dataset("/path/to/csv/files")
    print(f"  ✓ P4: {len(dataset.p4)} 行")
    print(f"  ✓ P5: {len(dataset.p5)} 行")
    print(f"  ✓ P6: {len(dataset.p6)} 行")
    print(f"  ✓ P10: {len(dataset.p10)} 行")
    print(f"  ✓ P13: {len(dataset.p13)} 行")
    print(f"  ✓ P15: {len(dataset.p15)} 行")

    # 步骤2：转换数据
    print("\n[2/4] 转换为看板 JSON...")
    data = transform_from_csv_dataset(dataset)
    print(f"  ✓ 转换完成")

    # 步骤3：构建推送载荷
    print("\n[3/4] 构建推送载荷...")
    payload = build_push_payload(data, month="202604", version="5.0.0")
    print(f"  ✓ 载荷构建完成")

    # 步骤4：打印示例
    print("\n[4/4] 预览推送内容...")
    print_push_example(data)

    return payload


if __name__ == "__main__":
    example_pipeline()
