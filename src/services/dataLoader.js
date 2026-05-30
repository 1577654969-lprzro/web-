/**
 * 数据加载服务
 * 统一管理数据来源切换（Mock / API / Vault）
 */
import { loadMockData } from "../adapters/mockAdapter";
import { fetchAndAdapt } from "../adapters/apiAdapter";

let _cache = null;

export function getCachedData() {
  return _cache;
}

export async function loadFromMock() {
  _cache = loadMockData();
  return _cache;
}

export async function loadFromServer() {
  const data = await fetchAndAdapt();
  if (data) _cache = data;
  return data || loadMockData();
}

export function getInitialData() {
  if (_cache) return _cache;
  _cache = loadMockData();
  return _cache;
}
