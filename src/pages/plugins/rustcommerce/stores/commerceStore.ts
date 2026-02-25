import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Product,
  ProductFilters,
  Category,
  Order,
  OrderFilters,
  Customer,
  StoreDashboard,
  StoreSettings,
  PaymentSettings,
  ShippingZone,
  TaxRate,
  Coupon,
  Review,
  EmailSettings,
  PaginatedResponse,
} from '../types';
import {
  productsApi,
  categoriesApi,
  ordersApi,
  customersApi,
  dashboardApi,
  settingsApi,
  couponsApi,
  reviewsApi,
} from '../api/commerceApi';

interface CommerceState {
  // Products
  products: PaginatedResponse<Product> | null;
  selectedProducts: Set<string>;
  productFilters: ProductFilters;
  currentProduct: Product | null;

  // Categories
  categories: Category[];
  categoryTree: Category[];

  // Orders
  orders: PaginatedResponse<Order> | null;
  selectedOrder: Order | null;
  orderFilters: OrderFilters;

  // Customers
  customers: PaginatedResponse<Customer> | null;
  selectedCustomer: Customer | null;

  // Dashboard
  dashboard: StoreDashboard | null;

  // Settings
  generalSettings: StoreSettings | null;
  paymentSettings: PaymentSettings | null;
  shippingZones: ShippingZone[];
  taxRates: TaxRate[];
  emailSettings: EmailSettings | null;

  // Coupons
  coupons: PaginatedResponse<Coupon> | null;

  // Reviews
  reviews: PaginatedResponse<Review> | null;

  // UI State
  loading: {
    products: boolean;
    orders: boolean;
    customers: boolean;
    dashboard: boolean;
    settings: boolean;
    coupons: boolean;
    reviews: boolean;
    categories: boolean;
  };
  error: string | null;

  // Product actions
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (data: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  bulkDeleteProducts: (ids: string[]) => Promise<void>;
  bulkUpdateProductStatus: (ids: string[], status: Product['status']) => Promise<void>;
  setProductFilters: (filters: Partial<ProductFilters>) => void;
  toggleProductSelection: (id: string) => void;
  clearProductSelection: () => void;
  selectAllProducts: (ids: string[]) => void;

  // Category actions
  fetchCategories: () => Promise<void>;
  fetchCategoryTree: () => Promise<void>;
  createCategory: (data: Partial<Category>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Order actions
  fetchOrders: (filters?: OrderFilters) => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  refundOrder: (id: string, amount?: string) => Promise<void>;
  setOrderFilters: (filters: Partial<OrderFilters>) => void;

  // Customer actions
  fetchCustomers: (params?: { search?: string; page?: number; per_page?: number }) => Promise<void>;
  fetchCustomer: (id: string) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;

  // Dashboard actions
  fetchDashboard: (period?: string) => Promise<void>;

  // Settings actions
  fetchGeneralSettings: () => Promise<void>;
  updateGeneralSettings: (data: Partial<StoreSettings>) => Promise<void>;
  fetchPaymentSettings: () => Promise<void>;
  updatePaymentSettings: (data: Partial<PaymentSettings>) => Promise<void>;
  fetchShippingZones: () => Promise<void>;
  updateShippingZones: (data: ShippingZone[]) => Promise<void>;
  fetchTaxRates: () => Promise<void>;
  updateTaxRates: (data: TaxRate[]) => Promise<void>;
  fetchEmailSettings: () => Promise<void>;
  updateEmailSettings: (data: Partial<EmailSettings>) => Promise<void>;

  // Coupon actions
  fetchCoupons: (params?: { page?: number; per_page?: number }) => Promise<void>;
  createCoupon: (data: Partial<Coupon>) => Promise<void>;
  updateCoupon: (id: string, data: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;

  // Review actions
  fetchReviews: (params?: { status?: Review['status']; page?: number; per_page?: number }) => Promise<void>;
  updateReviewStatus: (id: string, status: Review['status']) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  // Utility
  clearError: () => void;
}

export const useCommerceStore = create<CommerceState>()(
  persist(
    (set, get) => ({
      // Initial state
      products: null,
      selectedProducts: new Set<string>(),
      productFilters: { page: 1, per_page: 20, sort_by: 'created_at', sort_order: 'desc' },
      currentProduct: null,
      categories: [],
      categoryTree: [],
      orders: null,
      selectedOrder: null,
      orderFilters: { page: 1, per_page: 20, sort_by: 'created_at', sort_order: 'desc' },
      customers: null,
      selectedCustomer: null,
      dashboard: null,
      generalSettings: null,
      paymentSettings: null,
      shippingZones: [],
      taxRates: [],
      emailSettings: null,
      coupons: null,
      reviews: null,
      loading: {
        products: false,
        orders: false,
        customers: false,
        dashboard: false,
        settings: false,
        coupons: false,
        reviews: false,
        categories: false,
      },
      error: null,

      // Products
      fetchProducts: async (filters) => {
        set((s) => ({ loading: { ...s.loading, products: true }, error: null }));
        try {
          const merged = { ...get().productFilters, ...filters };
          const res = await productsApi.list(merged);
          set((s) => ({ products: res.data, productFilters: merged, loading: { ...s.loading, products: false } }));
        } catch (e: any) {
          set((s) => ({ error: e.message, loading: { ...s.loading, products: false } }));
        }
      },
      fetchProduct: async (id) => {
        set((s) => ({ loading: { ...s.loading, products: true }, error: null }));
        try {
          const res = await productsApi.get(id);
          set((s) => ({ currentProduct: res.data, loading: { ...s.loading, products: false } }));
        } catch (e: any) {
          set((s) => ({ error: e.message, loading: { ...s.loading, products: false } }));
        }
      },
      createProduct: async (data) => {
        const res = await productsApi.create(data);
        get().fetchProducts();
        return res.data;
      },
      updateProduct: async (id, data) => {
        const res = await productsApi.update(id, data);
        get().fetchProducts();
        return res.data;
      },
      deleteProduct: async (id) => {
        await productsApi.delete(id);
        get().fetchProducts();
      },
      bulkDeleteProducts: async (ids) => {
        await productsApi.bulkDelete(ids);
        set({ selectedProducts: new Set() });
        get().fetchProducts();
      },
      bulkUpdateProductStatus: async (ids, status) => {
        await productsApi.bulkUpdateStatus(ids, status);
        set({ selectedProducts: new Set() });
        get().fetchProducts();
      },
      setProductFilters: (filters) => {
        const merged = { ...get().productFilters, ...filters };
        set({ productFilters: merged });
      },
      toggleProductSelection: (id) => {
        const s = new Set(get().selectedProducts);
        if (s.has(id)) s.delete(id);
        else s.add(id);
        set({ selectedProducts: s });
      },
      clearProductSelection: () => set({ selectedProducts: new Set() }),
      selectAllProducts: (ids) => set({ selectedProducts: new Set(ids) }),

      // Categories
      fetchCategories: async () => {
        set((s) => ({ loading: { ...s.loading, categories: true } }));
        try {
          const res = await categoriesApi.list();
          set((s) => ({ categories: res.data, loading: { ...s.loading, categories: false } }));
        } catch (e: any) {
          set((s) => ({ error: e.message, loading: { ...s.loading, categories: false } }));
        }
      },
      fetchCategoryTree: async () => {
        try {
          const res = await categoriesApi.getTree();
          set({ categoryTree: res.data });
        } catch (e: any) {
          set({ error: e.message });
        }
      },
      createCategory: async (data) => {
        await categoriesApi.create(data);
        get().fetchCategories();
      },
      updateCategory: async (id, data) => {
        await categoriesApi.update(id, data);
        get().fetchCategories();
      },
      deleteCategory: async (id) => {
        await categoriesApi.delete(id);
        get().fetchCategories();
      },

      // Orders
      fetchOrders: async (filters) => {
        set((s) => ({ loading: { ...s.loading, orders: true }, error: null }));
        try {
          const merged = { ...get().orderFilters, ...filters };
          const res = await ordersApi.list(merged);
          set((s) => ({ orders: res.data, orderFilters: merged, loading: { ...s.loading, orders: false } }));
        } catch (e: any) {
          set((s) => ({ error: e.message, loading: { ...s.loading, orders: false } }));
        }
      },
      fetchOrder: async (id) => {
        set((s) => ({ loading: { ...s.loading, orders: true } }));
        try {
          const res = await ordersApi.get(id);
          set((s) => ({ selectedOrder: res.data, loading: { ...s.loading, orders: false } }));
        } catch (e: any) {
          set((s) => ({ error: e.message, loading: { ...s.loading, orders: false } }));
        }
      },
      updateOrderStatus: async (id, status) => {
        await ordersApi.updateStatus(id, status);
        get().fetchOrders();
      },
      refundOrder: async (id, amount) => {
        await ordersApi.refund(id, amount);
        get().fetchOrders();
      },
      setOrderFilters: (filters) => {
        set({ orderFilters: { ...get().orderFilters, ...filters } });
      },

      // Customers
      fetchCustomers: async (params) => {
        set((s) => ({ loading: { ...s.loading, customers: true } }));
        try {
          const res = await customersApi.list(params);
          set((s) => ({ customers: res.data, loading: { ...s.loading, customers: false } }));
        } catch (e: any) {
          set((s) => ({ error: e.message, loading: { ...s.loading, customers: false } }));
        }
      },
      fetchCustomer: async (id) => {
        set((s) => ({ loading: { ...s.loading, customers: true } }));
        try {
          const res = await customersApi.get(id);
          set((s) => ({ selectedCustomer: res.data, loading: { ...s.loading, customers: false } }));
        } catch (e: any) {
          set((s) => ({ error: e.message, loading: { ...s.loading, customers: false } }));
        }
      },
      updateCustomer: async (id, data) => {
        await customersApi.update(id, data);
      },

      // Dashboard
      fetchDashboard: async (period) => {
        set((s) => ({ loading: { ...s.loading, dashboard: true } }));
        try {
          const res = await dashboardApi.getMetrics(period);
          set((s) => ({ dashboard: res.data, loading: { ...s.loading, dashboard: false } }));
        } catch (e: any) {
          set((s) => ({ error: e.message, loading: { ...s.loading, dashboard: false } }));
        }
      },

      // Settings
      fetchGeneralSettings: async () => {
        set((s) => ({ loading: { ...s.loading, settings: true } }));
        try {
          const res = await settingsApi.getGeneral();
          set((s) => ({ generalSettings: res.data, loading: { ...s.loading, settings: false } }));
        } catch (e: any) {
          set((s) => ({ error: e.message, loading: { ...s.loading, settings: false } }));
        }
      },
      updateGeneralSettings: async (data) => {
        await settingsApi.updateGeneral(data);
        get().fetchGeneralSettings();
      },
      fetchPaymentSettings: async () => {
        set((s) => ({ loading: { ...s.loading, settings: true } }));
        try {
          const res = await settingsApi.getPayment();
          set((s) => ({ paymentSettings: res.data, loading: { ...s.loading, settings: false } }));
        } catch (e: any) {
          set((s) => ({ error: e.message, loading: { ...s.loading, settings: false } }));
        }
      },
      updatePaymentSettings: async (data) => {
        await settingsApi.updatePayment(data);
        get().fetchPaymentSettings();
      },
      fetchShippingZones: async () => {
        try {
          const res = await settingsApi.getShipping();
          set({ shippingZones: res.data });
        } catch (e: any) {
          set({ error: e.message });
        }
      },
      updateShippingZones: async (data) => {
        await settingsApi.updateShipping(data);
        get().fetchShippingZones();
      },
      fetchTaxRates: async () => {
        try {
          const res = await settingsApi.getTax();
          set({ taxRates: res.data });
        } catch (e: any) {
          set({ error: e.message });
        }
      },
      updateTaxRates: async (data) => {
        await settingsApi.updateTax(data);
        get().fetchTaxRates();
      },
      fetchEmailSettings: async () => {
        try {
          const res = await settingsApi.getEmail();
          set({ emailSettings: res.data });
        } catch (e: any) {
          set({ error: e.message });
        }
      },
      updateEmailSettings: async (data) => {
        await settingsApi.updateEmail(data);
        get().fetchEmailSettings();
      },

      // Coupons
      fetchCoupons: async (params) => {
        set((s) => ({ loading: { ...s.loading, coupons: true } }));
        try {
          const res = await couponsApi.list(params);
          set((s) => ({ coupons: res.data, loading: { ...s.loading, coupons: false } }));
        } catch (e: any) {
          set((s) => ({ error: e.message, loading: { ...s.loading, coupons: false } }));
        }
      },
      createCoupon: async (data) => {
        await couponsApi.create(data);
        get().fetchCoupons();
      },
      updateCoupon: async (id, data) => {
        await couponsApi.update(id, data);
        get().fetchCoupons();
      },
      deleteCoupon: async (id) => {
        await couponsApi.delete(id);
        get().fetchCoupons();
      },

      // Reviews
      fetchReviews: async (params) => {
        set((s) => ({ loading: { ...s.loading, reviews: true } }));
        try {
          const res = await reviewsApi.list(params);
          set((s) => ({ reviews: res.data, loading: { ...s.loading, reviews: false } }));
        } catch (e: any) {
          set((s) => ({ error: e.message, loading: { ...s.loading, reviews: false } }));
        }
      },
      updateReviewStatus: async (id, status) => {
        await reviewsApi.updateStatus(id, status);
        get().fetchReviews();
      },
      deleteReview: async (id) => {
        await reviewsApi.delete(id);
        get().fetchReviews();
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'rustpress-commerce',
      partialize: (state) => ({
        productFilters: state.productFilters,
        orderFilters: state.orderFilters,
      }),
    }
  )
);
