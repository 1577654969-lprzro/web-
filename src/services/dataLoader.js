/**
 * 数据加载服务 — 公司看板模式
 * 初始数据为空，数据只来自上传的 Excel
 */
import { fetchAndAdapt } from "../adapters/apiAdapter";
import { getEmptyData } from "../schemas/dashboard";

let _cache = null;

export function getCachedData() { return _cache; }

export async function loadFromServer() {
  const data = await fetchAndAdapt();
  if (data) _cache = data;
  return data || getEmptyData();
}

export function getInitialData() {
  if (_cache) return _cache;
  _cache = getEmptyData();
  return _cache;
}
