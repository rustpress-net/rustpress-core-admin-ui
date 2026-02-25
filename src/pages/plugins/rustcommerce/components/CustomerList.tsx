import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Users, Download } from 'lucide-react';
import { PageHeader, Card, CardBody, Button, DataTable, Input } from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import type { Customer } from '../types';

const mockCustomers: Customer[] = [
  {
    id: 'c1', email: 'john@example.com', first_name: 'John', last_name: 'Smith',
    phone: '+1 512-555-0123', total_orders: 12, total_spent: '1,847.50',
    avatar_url: null, notes: 'VIP customer', addresses: [],
    created_at: '2024-06-15T00:00:00Z', updated_at: '2024-12-14T00:00:00Z',
  },
  {
    id: 'c2', email: 'emma@example.com', first_name: 'Emma', last_name: 'Wilson',
    phone: '+1 503-555-0456', total_orders: 8, total_spent: '1,245.00',
    avatar_url: null, notes: '', addresses: [],
    created_at: '2024-07-20T00:00:00Z', updated_at: '2024-12-13T00:00:00Z',
  },
  {
    id: 'c3', email: 'mike@example.com', first_name: 'Mike', last_name: 'Chen',
    phone: '+1 206-555-0789', total_orders: 5, total_spent: '632.80',
    avatar_url: null, notes: '', addresses: [],
    created_at: '2024-08-10T00:00:00Z', updated_at: '2024-12-13T00:00:00Z',
  },
  {
    id: 'c4', email: 'sarah@example.com', first_name: 'Sarah', last_name: 'Johnson',
    phone: null, total_orders: 3, total_spent: '455.32',
    avatar_url: null, notes: '', addresses: [],
    created_at: '2024-09-05T00:00:00Z', updated_at: '2024-12-14T00:00:00Z',
  },
  {
    id: 'c5', email: 'alex@example.com', first_name: 'Alex', last_name: 'Kim',
    phone: '+1 415-555-0321', total_orders: 15, total_spent: '2,310.75',
    avatar_url: null, notes: 'Wholesale buyer', addresses: [],
    created_at: '2024-05-01T00:00:00Z', updated_at: '2024-12-12T00:00:00Z',
  },
  {
    id: 'c6', email: 'lisa@example.com', first_name: 'Lisa', last_name: 'Park',
    phone: null, total_orders: 2, total_spent: '178.54',
    avatar_url: null, notes: '', addresses: [],
    created_at: '2024-10-12T00:00:00Z', updated_at: '2024-12-11T00:00:00Z',
  },
  {
    id: 'c7', email: 'james@example.com', first_name: 'James', last_name: 'Taylor',
    phone: '+1 312-555-0654', total_orders: 7, total_spent: '987.20',
    avatar_url: null, notes: '', addresses: [],
    created_at: '2024-07-01T00:00:00Z', updated_at: '2024-12-10T00:00:00Z',
  },
];

export default function CustomerList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return mockCustomers;
    const q = search.toLowerCase();
    return mockCustomers.filter(
      (c) =>
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [search]);

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      render: (_: any, row: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold flex-shrink-0">
            {row.first_name.charAt(0)}{row.last_name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {row.first_name} {row.last_name}
            </p>
            <p className="text-xs text-neutral-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (value: string | null) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'total_orders',
      header: 'Orders',
      sortable: true,
      render: (value: number) => (
        <span className="text-sm font-medium text-neutral-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'total_spent',
      header: 'Total Spent',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm font-semibold text-neutral-900 dark:text-white">${value}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-neutral-500">
          {new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
  ], []);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Customers"
        description={`${filtered.length} customers`}
        actions={
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        }
      />

      <motion.div variants={fadeInUp}>
        <Input
          placeholder="Search customers by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          isClearable
          onClear={() => setSearch('')}
        />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <DataTable
          data={filtered}
          columns={columns}
          onRowClick={(row) => navigate(`/store/customers/${row.id}`)}
          pagination
          pageSize={20}
          hoverable
        />
      </motion.div>
    </motion.div>
  );
}
