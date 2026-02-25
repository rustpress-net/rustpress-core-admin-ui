import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Mail, Phone, MapPin, ShoppingBag, DollarSign, Calendar,
} from 'lucide-react';
import { PageHeader, Card, CardBody, CardHeader, Button, Badge, DataTable } from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import type { Customer, Address, Order, OrderStatus } from '../types';

const statusVariant: Record<OrderStatus, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'warning', processing: 'info', shipped: 'primary',
  delivered: 'success', cancelled: 'error', refunded: 'error',
};

const mockCustomer: Customer = {
  id: 'c1', email: 'john@example.com', first_name: 'John', last_name: 'Smith',
  phone: '+1 512-555-0123', total_orders: 12, total_spent: '1,847.50',
  avatar_url: null, notes: 'VIP customer. Prefers express shipping.',
  addresses: [
    { id: 'a1', first_name: 'John', last_name: 'Smith', company: 'Acme Inc', address_line1: '123 Main Street', address_line2: 'Apt 4B', city: 'Austin', state: 'TX', postal_code: '78701', country: 'US', phone: '+1 512-555-0123', is_default: true },
    { id: 'a2', first_name: 'John', last_name: 'Smith', company: null, address_line1: '456 Office Blvd', address_line2: 'Suite 200', city: 'Austin', state: 'TX', postal_code: '78702', country: 'US', phone: null, is_default: false },
  ],
  created_at: '2024-06-15T00:00:00Z', updated_at: '2024-12-14T00:00:00Z',
};

const mockOrders = [
  { id: '1', order_number: 'ORD-1024', status: 'processing' as OrderStatus, grand_total: '332.89', created_at: '2024-12-14T10:30:00Z' },
  { id: '2', order_number: 'ORD-1010', status: 'delivered' as OrderStatus, grand_total: '149.99', created_at: '2024-11-28T14:00:00Z' },
  { id: '3', order_number: 'ORD-0998', status: 'delivered' as OrderStatus, grand_total: '89.50', created_at: '2024-11-15T09:30:00Z' },
  { id: '4', order_number: 'ORD-0985', status: 'delivered' as OrderStatus, grand_total: '267.00', created_at: '2024-10-30T16:15:00Z' },
  { id: '5', order_number: 'ORD-0970', status: 'cancelled' as OrderStatus, grand_total: '55.00', created_at: '2024-10-10T11:00:00Z' },
];

function AddressCard({ address, label }: { address: Address; label: string }) {
  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-neutral-500 uppercase">{label}</span>
        {address.is_default && <Badge variant="primary" size="xs">Default</Badge>}
      </div>
      <div className="text-sm text-neutral-700 dark:text-neutral-300 space-y-0.5">
        <p className="font-medium text-neutral-900 dark:text-white">{address.first_name} {address.last_name}</p>
        {address.company && <p>{address.company}</p>}
        <p>{address.address_line1}</p>
        {address.address_line2 && <p>{address.address_line2}</p>}
        <p>{address.city}, {address.state} {address.postal_code}</p>
        <p>{address.country}</p>
        {address.phone && <p className="text-neutral-500">{address.phone}</p>}
      </div>
    </div>
  );
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customer = mockCustomer;

  const orderColumns = [
    {
      key: 'order_number',
      header: 'Order',
      render: (value: string) => <span className="text-sm font-semibold text-neutral-900 dark:text-white">{value}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: OrderStatus) => <Badge variant={statusVariant[value]} size="sm">{value}</Badge>,
    },
    {
      key: 'grand_total',
      header: 'Total',
      render: (value: string) => <span className="text-sm font-medium text-neutral-900 dark:text-white">${value}</span>,
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (value: string) => (
        <span className="text-sm text-neutral-500">
          {new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title={`${customer.first_name} ${customer.last_name}`}
        description={`Customer since ${new Date(customer.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
        actions={
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/store/customers')}>
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardBody className="text-center space-y-4">
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-bold mx-auto">
                  {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {customer.first_name} {customer.last_name}
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-400">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <ShoppingBag className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">{customer.total_orders}</p>
                    <p className="text-xs text-neutral-500">Orders</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <DollarSign className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">${customer.total_spent}</p>
                    <p className="text-xs text-neutral-500">Total Spent</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Notes */}
          {customer.notes && (
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Notes</h3>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{customer.notes}</p>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Addresses */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-500" />
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Addresses</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customer.addresses.map((addr, i) => (
                    <AddressCard key={addr.id} address={addr} label={`Address ${i + 1}`} />
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Order History */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-neutral-500" />
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Order History</h3>
                </div>
              </CardHeader>
              <CardBody padding="none">
                <DataTable
                  data={mockOrders}
                  columns={orderColumns}
                  onRowClick={(row) => navigate(`/store/orders/${row.id}`)}
                  hoverable
                />
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
