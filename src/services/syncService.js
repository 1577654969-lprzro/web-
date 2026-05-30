/**
 * 同步服务
 * Vault → Schema → Store 的数据同步逻辑
 */
import { syncFromVault } from "../adapters/apiAdapter";

export async function syncDashboardData() {
  const result = await syncFromVault();
  if (!result.data) {
    return { ok: false, message: "数据中心无可用数据" };
  }
  if (result.missing.length > 0) {
    return {
      ok: true,
      keys: result.keys,
      data: result.data,
      warning: `部分字段缺失: ${result.missing.join(", ")}`,
    };
  }
  return { ok: true, keys: result.keys, data: result.data };
}
