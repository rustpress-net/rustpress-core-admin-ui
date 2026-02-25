import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Eye, Download } from 'lucide-react';
import {
  PageHeader, Card, CardBody, Button, Badge, DataTable, Input,
} from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import type { Order, OrderStatus, PaymentStatus } from '../types';

const statusVariant: Record<OrderStatus, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'error',
};

const paymentVariant: Record<PaymentStatus, 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'error',
  refunded: 'error',
};

const dummyAddress = { id: 'a1', first_name: 'John', last_name: 'Doe', company: null, address_line1: '123 Main', address_line2: null, city: 'Austin', state: 'TX', postal_code: '78701', country: 'US', phone: null, is_default: true };

const mockOrders: Order[] = [
  {
    id: '1', order_number: 'ORD-1024', customer_id: 'c1', customer_email: 'john@example.com',
    customer_name: 'John Smith', status: 'processing', payment_status: 'completed',
    subtotal: '298.98', tax_total: '23.92', shipping_total: '9.99', discount_total: '0.00',
    grand_total: '332.89', currency: 'USD', shipping_address: dummyAddress, billing_address: dummyAddress,
    items: [], notes: '', coupon_code: null,
    created_at: '2024-12-14T10:30:00Z', updated_at: '2024-12-14T10:30:00Z',
  },
  {
    id: '2', order_number: 'ORD-1023', customer_id: 'c2', customer_email: 'emma@example.com',
    customer_name: 'Emma Wilson', status: 'shipped', payment_status: 'completed',
    subtotal: '249.00', tax_total: '19.92', shipping_total: '0.00', discount_total: '24.90',
    grand_total: '244.02', currency: 'USD', shipping_address: dummyAddress, billing_address: dummyAddress,
    items: [], notes: '', coupon_code: 'SAVE10',
    created_at: '2024-12-13T15:20:00Z', updated_at: '2024-12-14T08:00:00Z',
  },
  {
    id: '3', order_number: 'ORD-1022', customer_id: 'c3', customer_email: 'mike@example.com',
    customer_name: 'Mike Chen', status: 'delivered', payment_status: 'completed',
    subtotal: '89.00', tax_total: '7.12', shipping_total: '5.99', discount_total: '0.00',
    grand_total: '102.11', currency: 'USD', shipping_address: dummyAddress, billing_address: dummyAddress,
    items: [], notes: '', coupon_code: null,
    created_at: '2024-12-13T09:45:00Z', updated_at: '2024-12-14T12:00:00Z',
  },
  {
    id: '4', order_number: 'ORD-1021', customer_id: 'c4', customer_email: 'sarah@example.com',
    customer_name: 'Sarah Johnson', status: 'pending', payment_status: 'pending',
    subtotal: '329.00', tax_total: '26.32', shipping_total: '0.00', discount_total: '0.00',
    grand_total: '355.32', currency: 'USD', shipping_address: dummyAddress, billing_address: dummyAddress,
    items: [], notes: '', coupon_code: null,
    created_at: '2024-12-14T14:10:00Z', updated_at: '2024-12-14T14:10:00Z',
  },
  {
    id: '5', order_number: 'ORD-1020', customer_id: 'c5', customer_email: 'alex@example.com',
    customer_name: 'Alex Kim', status: 'cancelled', payment_status: 'refunded',
    subtotal: '159.00', tax_total: '12.72', shipping_total: '9.99', discount_total: '0.00',
    grand_total: '181.71', currency: 'USD', shipping_address: dummyAddress, billing_address: dummyAddress,
    items: [], notes: 'Customer requested cancellation', coupon_code: null,
    created_at: '2024-12-12T11:00:00Z', updated_at: '2024-12-13T09:00:00Z',
  },
  {
    id: '6', order_number: 'ORD-1019', customer_id: 'c6', customer_email: 'lisa@example.com',
    customer_name: 'Lisa Park', status: 'delivered', payment_status: 'completed',
    subtotal: '78.50', tax_total: '6.28', shipping_total: '5.99', discount_total: '0.00',
    grand_total: '90.77', currency: 'USD', shipping_address: dummyAddress, billing_address: dummyAddress,
    items: [], notes: '', coupon_code: null,
    created_at: '2024-12-11T16:30:00Z', updated_at: '2024-12-13T14:00:00Z',
  },
];

const tabs: { label: string; value: OrderStatus | 'all'; count: number }[] = [
  { label: 'All', value: 'all', count: mockOrders.length },
  { label: 'Pending', value: 'pending', count: mockOrders.filter((o) => o.status === 'pending').length },
  { label: 'Processing', value: 'processing', count: mockOrders.filter((o) => o.status === 'processing').length },
  { label: 'Shipped', value: 'shipped', count: mockOrders.filter((o) => o.status === 'shipped').length },
  { label: 'Delivered', value: 'delivered', count: mockOrders.filter((o) => o.status === 'delivered').length },
  { label: 'Cancelled', value: 'cancelled', count: mockOrders.filter((o) => o.status === 'cancelled').length },
];

export default function OrderList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = useMemo(() => {
    let list = mockOrders;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) => o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((o) => o.status === statusFilter);
    }
    return list;
  }, [search, statusFilter]);

  const columns = useMemo(() => [
    {
      key: 'order_number',
      header: 'Order',
      sortable: true,
      render: (_: any, row: Order) => (
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">{row.order_number}</p>
          <p className="text-xs text-neutral-500">
            {new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      sortable: true,
      render: (_: any, row: Order) => (
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-white">{row.customer_name}</p>
          <p className="text-xs text-neutral-500">{row.customer_email}</p>
        </div>
      ),
    },
    {
      key: 'grand_total',
      header: 'Total',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm font-semibold text-neutral-900 dark:text-white">${value}</span>
      ),
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (value: PaymentStatus) => (
        <Badge variant={paymentVariant[value]} size="sm">{value}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: OrderStatus) => (
        <Badge variant={statusVariant[value]} size="sm">{value}</Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 50,
      render: (_: any, row: Order) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/store/orders/${row.id}`); }}>
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ], [navigate]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Orders"
        description={`${filteredOrders.length} orders`}
        actions={
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        }
      />

      {/* Status Tabs */}
      <motion.div variants={fadeInUp}>
        <Card variant="default">
          <CardBody padding="none">
            <div className="flex gap-1 p-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    statusFilter === tab.value
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs opacity-60">({tab.count})</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeInUp}>
        <Input
          placeholder="Search by order number, customer name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          isClearable
          onClear={() => setSearch('')}
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeInUp}>
        <DataTable
          data={filteredOrders}
          columns={columns}
          onRowClick={(row) => navigate(`/store/orders/${row.id}`)}
          pagination
          pageSize={20}
          hoverable
        />
      </motion.div>
    </motion.div>
  );
}
