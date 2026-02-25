import { apiClient } from '@/api/client';
import type {
  Product,
  ProductFilters,
  Category,
  Order,
  OrderFilters,
  OrderStatus,
  Customer,
  StoreDashboard,
  StoreSettings,
  PaymentSettings,
  ShippingZone,
  TaxRate,
  Coupon,
  Review,
  ReviewStatus,
  ProductStatus,
  PaginatedResponse,
  EmailSettings,
} from '../types';

const BASE = '/v1/rustcommerce';
const ADMIN_BASE = '/v1/admin/rustcommerce';

// Products
export const productsApi = {
  list: (filters?: ProductFilters) =>
    apiClient.get<PaginatedResponse<Product>>(`${ADMIN_BASE}/products`, { params: filters }),
  get: (id: string) =>
    apiClient.get<Product>(`${ADMIN_BASE}/products/${id}`),
  create: (data: Partial<Product>) =>
    apiClient.post<Product>(`${ADMIN_BASE}/products`, data),
  update: (id: string, data: Partial<Product>) =>
    apiClient.put<Product>(`${ADMIN_BASE}/products/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`${ADMIN_BASE}/products/${id}`),
  bulkDelete: (ids: string[]) =>
    apiClient.post(`${ADMIN_BASE}/products/bulk-delete`, { ids }),
  bulkUpdateStatus: (ids: string[], status: ProductStatus) =>
    apiClient.post(`${ADMIN_BASE}/products/bulk-status`, { ids, status }),
};

// Categories
export const categoriesApi = {
  list: () =>
    apiClient.get<Category[]>(`${ADMIN_BASE}/categories`),
  getTree: () =>
    apiClient.get<Category[]>(`${ADMIN_BASE}/categories/tree`),
  get: (id: string) =>
    apiClient.get<Category>(`${ADMIN_BASE}/categories/${id}`),
  create: (data: Partial<Category>) =>
    apiClient.post<Category>(`${ADMIN_BASE}/categories`, data),
  update: (id: string, data: Partial<Category>) =>
    apiClient.put<Category>(`${ADMIN_BASE}/categories/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`${ADMIN_BASE}/categories/${id}`),
};

// Orders
export const ordersApi = {
  list: (filters?: OrderFilters) =>
    apiClient.get<PaginatedResponse<Order>>(`${ADMIN_BASE}/orders`, { params: filters }),
  get: (id: string) =>
    apiClient.get<Order>(`${ADMIN_BASE}/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus) =>
    apiClient.patch(`${ADMIN_BASE}/orders/${id}/status`, { status }),
  refund: (id: string, amount?: string) =>
    apiClient.post(`${ADMIN_BASE}/orders/${id}/refund`, { amount }),
};

// Customers
export const customersApi = {
  list: (params?: { search?: string; page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Customer>>(`${ADMIN_BASE}/customers`, { params }),
  get: (id: string) =>
    apiClient.get<Customer>(`${ADMIN_BASE}/customers/${id}`),
  update: (id: string, data: Partial<Customer>) =>
    apiClient.put<Customer>(`${ADMIN_BASE}/customers/${id}`, data),
};

// Dashboard
export const dashboardApi = {
  getMetrics: (period?: string) =>
    apiClient.get<StoreDashboard>(`${ADMIN_BASE}/dashboard`, { params: { period } }),
};

// Settings
export const settingsApi = {
  getGeneral: () =>
    apiClient.get<StoreSettings>(`${ADMIN_BASE}/settings/general`),
  updateGeneral: (data: Partial<StoreSettings>) =>
    apiClient.put(`${ADMIN_BASE}/settings/general`, data),
  getPayment: () =>
    apiClient.get<PaymentSettings>(`${ADMIN_BASE}/settings/payment`),
  updatePayment: (data: Partial<PaymentSettings>) =>
    apiClient.put(`${ADMIN_BASE}/settings/payment`, data),
  getShipping: () =>
    apiClient.get<ShippingZone[]>(`${ADMIN_BASE}/settings/shipping`),
  updateShipping: (data: ShippingZone[]) =>
    apiClient.put(`${ADMIN_BASE}/settings/shipping`, data),
  getTax: () =>
    apiClient.get<TaxRate[]>(`${ADMIN_BASE}/settings/tax`),
  updateTax: (data: TaxRate[]) =>
    apiClient.put(`${ADMIN_BASE}/settings/tax`, data),
  getEmail: () =>
    apiClient.get<EmailSettings>(`${ADMIN_BASE}/settings/email`),
  updateEmail: (data: Partial<EmailSettings>) =>
    apiClient.put(`${ADMIN_BASE}/settings/email`, data),
};

// Coupons
export const couponsApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Coupon>>(`${ADMIN_BASE}/coupons`, { params }),
  get: (id: string) =>
    apiClient.get<Coupon>(`${ADMIN_BASE}/coupons/${id}`),
  create: (data: Partial<Coupon>) =>
    apiClient.post<Coupon>(`${ADMIN_BASE}/coupons`, data),
  update: (id: string, data: Partial<Coupon>) =>
    apiClient.put<Coupon>(`${ADMIN_BASE}/coupons/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`${ADMIN_BASE}/coupons/${id}`),
};

// Reviews
export const reviewsApi = {
  list: (params?: { status?: ReviewStatus; page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Review>>(`${ADMIN_BASE}/reviews`, { params }),
  get: (id: string) =>
    apiClient.get<Review>(`${ADMIN_BASE}/reviews/${id}`),
  updateStatus: (id: string, status: ReviewStatus) =>
    apiClient.patch(`${ADMIN_BASE}/reviews/${id}/status`, { status }),
  delete: (id: string) =>
    apiClient.delete(`${ADMIN_BASE}/reviews/${id}`),
};
