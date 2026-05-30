/**
 * API 数据适配器
 * 后端 JSON → 统一 Schema → Store
 */
import { withDefaults, validateSchema } from "../schemas/dashboard";
import { API, VAULT_API } from "../config/api";

export async function fetchAndAdapt() {
  try {
    const res = await fetch(`${API}/data/load`);
    const json = await res.json();
    if (json.status === "ok" && json.data) {
      return withDefaults(json.data);
    }
  } catch { /* offline */ }
  return null;
}

export async function syncFromVault() {
  try {
    const res = await fetch(`${VAULT_API}/sync`, { method: "POST" });
    const json = await res.json();
    if (json.status === "ok" && json.data) {
      const adapted = withDefaults(json.data);
      const check = validateSchema(adapted);
      return { data: adapted, keys: json.keys, missing: check.missing };
    }
    return { data: null, keys: 0, missing: [] };
  } catch {
    return { data: null, keys: 0, missing: [] };
  }
}
