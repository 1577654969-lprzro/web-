/**
 * Mock 数据适配器
 * mockData → 统一 Schema → Store
 */
import * as mockData from "../data/mockData";
import { withDefaults } from "../schemas/dashboard";

export function loadMockData() {
  return withDefaults({
    overviewData: mockData.overviewData,
    expenseBreakdown: mockData.expenseBreakdown,
    departmentData: mockData.departmentData,
    bizCustomerTop10: mockData.bizCustomerTop10,
    bizProductTop10: mockData.bizProductTop10,
    productCategoryData: mockData.productCategoryData,
    keyCustomerData: mockData.keyCustomerData,
    onlineSalesData: mockData.onlineSalesData,
    arData: mockData.arData,
    apData: mockData.apData,
    arByPerson: mockData.arByPerson,
    inventoryProduct: mockData.inventoryProduct,
    inventorySupplier: mockData.inventorySupplier,
    freightOverview: mockData.freightOverview,
    freightByChannel: mockData.freightByChannel,
  });
}
