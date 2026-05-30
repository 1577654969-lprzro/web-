/**
 * 智能数据适配层 (Data Normalizer)
 * 
 * 核心功能：
 * 1. 模糊字段映射 (Fuzzy Field Mapping)
 * 2. 数据结构标准化 (Structure Normalization)
 * 3. 字段类型强制转换 (Type Casting)
 * 4. 异常诊断报告 (Health Diagnostics)
 */

import { DASHBOARD_SCHEMA } from "../schemas/dashboardSchema";

/**
 * 智能字段映射：根据别名查找匹配的字段名
 */
function findMappedField(rawKey, aliases = []) {
  const key = rawKey.toLowerCase();
  if (aliases.some(a => a.toLowerCase() === key)) return true;
  // 简单的模糊匹配：包含关系
  if (aliases.some(a => key.includes(a.toLowerCase()) || a.toLowerCase().includes(key))) return true;
  return false;
}

/**
 * 强制类型转换
 */
function castValue(val, type) {
  if (type === "number") {
    if (typeof val === "number") return val;
    if (!val) return 0;
    const n = parseFloat(String(val).replace(/,/g, "").replace(/%/g, ""));
    return isNaN(n) ? 0 : n;
  }
  if (type === "string") {
    return val === null || val === undefined ? "" : String(val);
  }
  return val;
}

/**
 * 标准化单个对象 (根据 ItemSchema)
 */
function normalizeItem(rawItem, itemSchema) {
  const result = {};
  const rawKeys = Object.keys(rawItem);

  Object.entries(itemSchema).forEach(([targetKey, config]) => {
    // 1. 尝试直接匹配
    let sourceKey = rawKeys.find(rk => rk === targetKey);
    // 2. 尝试别名匹配
    if (!sourceKey && config.aliases) {
      sourceKey = rawKeys.find(rk => findMappedField(rk, config.aliases));
    }

    if (sourceKey) {
      result[targetKey] = castValue(rawItem[sourceKey], config.type);
    } else {
      // 默认值填充
      result[targetKey] = config.type === "number" ? 0 : "";
    }
  });

  return result;
}

/**
 * 标准化整个数据包
 */
export function normalizeDashboardData(rawData) {
  const normalized = {};
  const diagnostics = {
    missingModules: [],
    fieldErrors: [],
    timestamp: Date.now()
  };

  Object.entries(DASHBOARD_SCHEMA).forEach(([moduleKey, schema]) => {
    const rawValue = rawData[moduleKey];

    if (!rawValue) {
      diagnostics.missingModules.push(moduleKey);
      // 提供空数组或对象作为 Fallback，防止 UI 崩溃
      normalized[moduleKey] = schema.type === "array" ? [] : {};
      return;
    }

    if (schema.type === "array") {
      const items = Array.isArray(rawValue) ? rawValue : [];
      normalized[moduleKey] = items.map(item => normalizeItem(item, schema.itemSchema));
    } else if (schema.type === "object") {
      // 对象类型的深度映射逻辑可根据需求扩展，目前先做简单浅拷贝
      normalized[moduleKey] = rawValue;
    }
  });

  return { data: normalized, diagnostics };
}

/**
 * 校验 Schema 完整性
 */
export function validateSchema(data) {
  const missing = Object.keys(DASHBOARD_SCHEMA).filter(key => !data[key]);
  return { valid: missing.length === 0, missing };
}
