/**
 * 数据标准化工具
 * 处理空值、类型转换、默认值
 */

export function safeNum(val, fallback = 0) {
  if (val == null) return fallback;
  if (typeof val === "number") return val;
  const n = Number(val);
  return Number.isNaN(n) ? fallback : n;
}

export function safeStr(val, fallback = "") {
  return val != null ? String(val) : fallback;
}

export function safeArr(val) {
  return Array.isArray(val) ? val : [];
}

export function safeObj(val) {
  return val && typeof val === "object" && !Array.isArray(val) ? val : {};
}

export function sum(arr, key) {
  return safeArr(arr).reduce((s, item) => s + safeNum(item?.[key]), 0);
}

export function pct(part, total) {
  return total > 0 ? (safeNum(part) / total) * 100 : 0;
}
