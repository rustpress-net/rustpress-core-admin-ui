import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  DollarSign, ShoppingCart, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Package, Eye,
} from 'lucide-react';
import { Card, CardBody, CardHeader, Badge, Button, PageHeader } from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import type { StoreDashboard, Order } from '../types';

// Mock data for when API is unavailable
const mockDashboard: StoreDashboard = {
  total_revenue: '48,295.00',
  total_orders: 324,
  total_customers: 1205,
  average_order_value: '149.06',
  revenue_change: 12.5,
  orders_change: 8.3,
  customers_change: 15.2,
  aov_change: -2.1,
  revenue_chart: [
    { date: '2024-12-01', revenue: 4200 },
    { date: '2024-12-02', revenue: 3800 },
    { date: '2024-12-03', revenue: 5100 },
    { date: '2024-12-04', revenue: 4700 },
    { date: '2024-12-05', revenue: 5900 },
    { date: '2024-12-06', revenue: 4300 },
    { date: '2024-12-07', revenue: 6200 },
    { date: '2024-12-08', revenue: 5500 },
    { date: '2024-12-09', revenue: 4800 },
    { date: '2024-12-10', revenue: 7100 },
    { date: '2024-12-11', revenue: 6400 },
    { date: '2024-12-12', revenue: 5800 },
    { date: '2024-12-13', revenue: 6900 },
    { date: '2024-12-14', revenue: 7500 },
  ],
  order_status_chart: [
    { status: 'Pending', count: 28 },
    { status: 'Processing', count: 45 },
    { status: 'Shipped', count: 112 },
    { status: 'Delivered', count: 198 },
    { status: 'Cancelled', count: 12 },
  ],
  top_products: [
    { id: '1', name: 'Premium Wireless Headphones', revenue: '8,450.00', units_sold: 169 },
    { id: '2', name: 'Smart Watch Pro', revenue: '6,720.00', units_sold: 84 },
    { id: '3', name: 'Organic Cotton T-Shirt', revenue: '4,350.00', units_sold: 290 },
    { id: '4', name: 'Leather Messenger Bag', revenue: '3,890.00', units_sold: 43 },
    { id: '5', name: 'Bluetooth Speaker', revenue: '3,120.00', units_sold: 156 },
  ],
  recent_orders: [
    {
      id: '1', order_number: 'ORD-1024', customer_id: 'c1', customer_email: 'john@example.com',
      customer_name: 'John Smith', status: 'processing', payment_status: 'completed',
      subtotal: '159.00', tax_total: '12.72', shipping_total: '9.99', discount_total: '0.00',
      grand_total: '181.71', currency: 'USD',
      shipping_address: { id: 'a1', first_name: 'John', last_name: 'Smith', company: null, address_line1: '123 Main St', address_line2: null, city: 'Austin', state: 'TX', postal_code: '78701', country: 'US', phone: null, is_default: true },
      billing_address: { id: 'a2', first_name: 'John', last_name: 'Smith', company: null, address_line1: '123 Main St', address_line2: null, city: 'Austin', state: 'TX', postal_code: '78701', country: 'US', phone: null, is_default: true },
      items: [], notes: '', coupon_code: null,
      created_at: '2024-12-14T10:30:00Z', updated_at: '2024-12-14T10:30:00Z',
    },
    {
      id: '2', order_number: 'ORD-1023', customer_id: 'c2', customer_email: 'emma@example.com',
      customer_name: 'Emma Wilson', status: 'shipped', payment_status: 'completed',
      subtotal: '249.00', tax_total: '19.92', shipping_total: '0.00', discount_total: '24.90',
      grand_total: '244.02', currency: 'USD',
      shipping_address: { id: 'a3', first_name: 'Emma', last_name: 'Wilson', company: null, address_line1: '456 Oak Ave', address_line2: null, city: 'Portland', state: 'OR', postal_code: '97201', country: 'US', phone: null, is_default: true },
      billing_address: { id: 'a4', first_name: 'Emma', last_name: 'Wilson', company: null, address_line1: '456 Oak Ave', address_line2: null, city: 'Portland', state: 'OR', postal_code: '97201', country: 'US', phone: null, is_default: true },
      items: [], notes: '', coupon_code: 'SAVE10',
      created_at: '2024-12-13T15:20:00Z', updated_at: '2024-12-14T08:00:00Z',
    },
    {
      id: '3', order_number: 'ORD-1022', customer_id: 'c3', customer_email: 'mike@example.com',
      customer_name: 'Mike Chen', status: 'delivered', payment_status: 'completed',
      subtotal: '89.00', tax_total: '7.12', shipping_total: '5.99', discount_total: '0.00',
      grand_total: '102.11', currency: 'USD',
      shipping_address: { id: 'a5', first_name: 'Mike', last_name: 'Chen', company: null, address_line1: '789 Pine Rd', address_line2: null, city: 'Seattle', state: 'WA', postal_code: '98101', country: 'US', phone: null, is_default: true },
      billing_address: { id: 'a6', first_name: 'Mike', last_name: 'Chen', company: null, address_line1: '789 Pine Rd', address_line2: null, city: 'Seattle', state: 'WA', postal_code: '98101', country: 'US', phone: null, is_default: true },
      items: [], notes: '', coupon_code: null,
      created_at: '2024-12-13T09:45:00Z', updated_at: '2024-12-14T12:00:00Z',
    },
    {
      id: '4', order_number: 'ORD-1021', customer_id: 'c4', customer_email: 'sarah@example.com',
      customer_name: 'Sarah Johnson', status: 'pending', payment_status: 'pending',
      subtotal: '329.00', tax_total: '26.32', shipping_total: '0.00', discount_total: '0.00',
      grand_total: '355.32', currency: 'USD',
      shipping_address: { id: 'a7', first_name: 'Sarah', last_name: 'Johnson', company: null, address_line1: '321 Elm St', address_line2: null, city: 'Denver', state: 'CO', postal_code: '80201', country: 'US', phone: null, is_default: true },
      billing_address: { id: 'a8', first_name: 'Sarah', last_name: 'Johnson', company: null, address_line1: '321 Elm St', address_line2: null, city: 'Denver', state: 'CO', postal_code: '80201', country: 'US', phone: null, is_default: true },
      items: [], notes: '', coupon_code: null,
      created_at: '2024-12-14T14:10:00Z', updated_at: '2024-12-14T14:10:00Z',
    },
  ],
};

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444'];

const statusVariantMap: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
};

const paymentVariantMap: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'error',
  refunded: 'error',
};

function MetricCardItem({
  title, value, change, icon, color,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}) {
  const isPositive = change >= 0;
  return (
    <motion.div variants={fadeInUp}>
      <Card variant="default" className="h-full">
        <CardBody>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
              <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
              {icon}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-success-600 dark:text-success-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-error-600 dark:text-error-400" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">vs last period</span>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data] = useState<StoreDashboard>(mockDashboard);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const metrics = useMemo(() => [
    {
      title: 'Total Revenue',
      value: `$${data.total_revenue}`,
      change: data.revenue_change,
      icon: <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      color: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      title: 'Total Orders',
      value: data.total_orders.toLocaleString(),
      change: data.orders_change,
      icon: <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      color: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Total Customers',
      value: data.total_customers.toLocaleString(),
      change: data.customers_change,
      icon: <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      color: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      title: 'Avg Order Value',
      value: `$${data.average_order_value}`,
      change: data.aov_change,
      icon: <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      color: 'bg-amber-100 dark:bg-amber-900/30',
    },
  ], [data]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Store Dashboard"
        description="Overview of your store performance"
        actions={
          <div className="flex items-center gap-2">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <MetricCardItem key={m.title} {...m} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <Card variant="default">
            <CardHeader>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Revenue Overview</h3>
            </CardHeader>
            <CardBody>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenue_chart}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      className="text-xs"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                      tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                      className="text-xs"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Order Status Pie */}
        <motion.div variants={fadeInUp}>
          <Card variant="default" className="h-full">
            <CardHeader>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Order Status</h3>
            </CardHeader>
            <CardBody>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={data.order_status_chart}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="status"
                    >
                      {data.order_status_chart.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      formatter={(value) => (
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">{value}</span>
                      )}
                    />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div variants={fadeInUp}>
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Top Products</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/store/products')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardBody padding="none">
              <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {data.top_products.map((product, i) => (
                  <div key={product.id} className="flex items-center gap-4 px-6 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <span className="text-sm font-medium text-neutral-400 w-6">#{i + 1}</span>
                    <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{product.name}</p>
                      <p className="text-xs text-neutral-500">{product.units_sold} units sold</p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">${product.revenue}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div variants={fadeInUp}>
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Recent Orders</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/store/orders')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardBody padding="none">
              <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {data.recent_orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/store/orders/${order.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{order.order_number}</p>
                        <Badge variant={statusVariantMap[order.status] || 'default'} size="xs">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">${order.grand_total}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <Eye className="w-4 h-4 text-neutral-400" />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
