// Product types
export type ProductStatus = 'draft' | 'published' | 'archived';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  compare_at_price: string | null;
  cost_price: string | null;
  status: ProductStatus;
  featured: boolean;
  weight: number | null;
  category_ids: string[];
  tags: string[];
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  allow_backorders: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  position: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: string;
  stock_quantity: number;
  option_name: string;
  option_value: string;
  weight: number | null;
  is_default: boolean;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  image_url: string | null;
  position: number;
  product_count: number;
  children?: Category[];
}

// Cart types
export interface Cart {
  id: string;
  customer_id: string | null;
  session_id: string | null;
  items: CartItem[];
  subtotal: string;
  tax_total: string;
  shipping_total: string;
  discount_total: string;
  grand_total: string;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

// Order types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_email: string;
  customer_name: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: string;
  tax_total: string;
  shipping_total: string;
  discount_total: string;
  grand_total: string;
  currency: string;
  shipping_address: Address;
  billing_address: Address;
  items: OrderItem[];
  notes: string;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  sku: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

// Customer types
export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  total_orders: number;
  total_spent: string;
  avatar_url: string | null;
  notes: string;
  addresses: Address[];
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
}

// Payment
export interface Payment {
  id: string;
  order_id: string;
  method: string;
  status: PaymentStatus;
  amount: string;
  currency: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
}

// Shipping
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  shipping_type: 'flat_rate' | 'free_shipping' | 'weight_based';
  price: string;
  free_threshold: string | null;
  min_weight: number | null;
  max_weight: number | null;
  is_active: boolean;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  methods: ShippingMethod[];
}

// Tax
export interface TaxRate {
  id: string;
  name: string;
  rate: string;
  country: string;
  state: string | null;
  tax_type: 'percentage' | 'fixed';
  is_active: boolean;
  priority: number;
}

// Coupon
export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: string;
  minimum_order_amount: string | null;
  maximum_discount: string | null;
  usage_limit: number | null;
  usage_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

// Review
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  title: string;
  content: string;
  status: ReviewStatus;
  verified_purchase: boolean;
  created_at: string;
}

// Dashboard/Analytics
export interface StoreDashboard {
  total_revenue: string;
  total_orders: number;
  total_customers: number;
  average_order_value: string;
  revenue_change: number;
  orders_change: number;
  customers_change: number;
  aov_change: number;
  revenue_chart: { date: string; revenue: number }[];
  order_status_chart: { status: string; count: number }[];
  top_products: { id: string; name: string; revenue: string; units_sold: number }[];
  recent_orders: Order[];
}

// Store Settings
export interface StoreSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_address: string;
  currency: string;
  currency_symbol: string;
  currency_position: 'before' | 'after';
  thousand_separator: string;
  decimal_separator: string;
  decimals: number;
  weight_unit: 'kg' | 'lb' | 'g' | 'oz';
  dimension_unit: 'cm' | 'in' | 'm' | 'mm';
}

export interface PaymentSettings {
  stripe_enabled: boolean;
  stripe_publishable_key: string;
  stripe_secret_key: string;
  stripe_webhook_secret: string;
  test_mode: boolean;
  payment_methods: string[];
}

export interface EmailSettings {
  order_confirmation: boolean;
  shipping_notification: boolean;
  status_updates: boolean;
  review_request: boolean;
  abandoned_cart: boolean;
  sender_name: string;
  sender_email: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// API Query params
export interface ProductFilters {
  search?: string;
  status?: ProductStatus;
  category_id?: string;
  min_price?: string;
  max_price?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
