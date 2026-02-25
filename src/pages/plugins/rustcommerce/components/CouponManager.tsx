import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Search, Trash2, Edit, Percent, Tag, DollarSign, Truck, Gift,
} from 'lucide-react';
import {
  PageHeader, Card, CardBody, Button, Badge, DataTable, Input, Modal, ModalFooter,
} from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import toast from 'react-hot-toast';
import type { Coupon, DiscountType } from '../types';

const mockCoupons: Coupon[] = [
  { id: '1', code: 'SAVE10', description: '10% off all orders', discount_type: 'percentage', discount_value: '10', minimum_order_amount: '50.00', maximum_discount: '100.00', usage_limit: 100, usage_count: 43, starts_at: '2024-12-01T00:00:00Z', expires_at: '2025-01-31T23:59:59Z', is_active: true, created_at: '2024-11-30T00:00:00Z' },
  { id: '2', code: 'FLAT20', description: '$20 off orders over $100', discount_type: 'fixed_amount', discount_value: '20', minimum_order_amount: '100.00', maximum_discount: null, usage_limit: 50, usage_count: 12, starts_at: '2024-12-01T00:00:00Z', expires_at: '2025-03-31T23:59:59Z', is_active: true, created_at: '2024-11-28T00:00:00Z' },
  { id: '3', code: 'FREESHIP', description: 'Free shipping on all orders', discount_type: 'free_shipping', discount_value: '0', minimum_order_amount: '25.00', maximum_discount: null, usage_limit: null, usage_count: 89, starts_at: null, expires_at: null, is_active: true, created_at: '2024-10-15T00:00:00Z' },
  { id: '4', code: 'BUY2GET1', description: 'Buy 2 get 1 free on selected items', discount_type: 'buy_x_get_y', discount_value: '100', minimum_order_amount: null, maximum_discount: null, usage_limit: 30, usage_count: 30, starts_at: '2024-11-01T00:00:00Z', expires_at: '2024-12-31T23:59:59Z', is_active: false, created_at: '2024-10-25T00:00:00Z' },
  { id: '5', code: 'WELCOME15', description: '15% off for new customers', discount_type: 'percentage', discount_value: '15', minimum_order_amount: null, maximum_discount: '50.00', usage_limit: null, usage_count: 256, starts_at: null, expires_at: null, is_active: true, created_at: '2024-06-01T00:00:00Z' },
];

const discountTypeIcons: Record<DiscountType, React.ReactNode> = {
  percentage: <Percent className="w-4 h-4" />,
  fixed_amount: <DollarSign className="w-4 h-4" />,
  free_shipping: <Truck className="w-4 h-4" />,
  buy_x_get_y: <Gift className="w-4 h-4" />,
};

const discountTypeLabels: Record<DiscountType, string> = {
  percentage: 'Percentage',
  fixed_amount: 'Fixed Amount',
  free_shipping: 'Free Shipping',
  buy_x_get_y: 'Buy X Get Y',
};

function formatDiscountValue(coupon: Coupon): string {
  switch (coupon.discount_type) {
    case 'percentage': return `${coupon.discount_value}%`;
    case 'fixed_amount': return `$${coupon.discount_value}`;
    case 'free_shipping': return 'Free';
    case 'buy_x_get_y': return 'BOGO';
    default: return coupon.discount_value;
  }
}

const emptyCoupon: Partial<Coupon> = {
  code: '', description: '', discount_type: 'percentage', discount_value: '',
  minimum_order_amount: null, maximum_discount: null, usage_limit: null,
  starts_at: null, expires_at: null, is_active: true,
};

export default function CouponManager() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Partial<Coupon>>(emptyCoupon);
  const [isEditing, setIsEditing] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return mockCoupons;
    const q = search.toLowerCase();
    return mockCoupons.filter(
      (c) => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [search]);

  const openCreate = useCallback(() => {
    setEditCoupon(emptyCoupon);
    setIsEditing(false);
    setShowModal(true);
  }, []);

  const openEdit = useCallback((coupon: Coupon) => {
    setEditCoupon({ ...coupon });
    setIsEditing(true);
    setShowModal(true);
  }, []);

  const handleSave = useCallback(() => {
    toast.success(isEditing ? 'Coupon updated' : 'Coupon created');
    setShowModal(false);
  }, [isEditing]);

  const columns = useMemo(() => [
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      render: (_: any, row: Coupon) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800">
            {discountTypeIcons[row.discount_type]}
          </div>
          <div>
            <p className="text-sm font-mono font-semibold text-neutral-900 dark:text-white">{row.code}</p>
            <p className="text-xs text-neutral-500">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'discount_type',
      header: 'Type',
      render: (value: DiscountType) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{discountTypeLabels[value]}</span>
      ),
    },
    {
      key: 'discount_value',
      header: 'Value',
      render: (_: any, row: Coupon) => (
        <span className="text-sm font-semibold text-neutral-900 dark:text-white">{formatDiscountValue(row)}</span>
      ),
    },
    {
      key: 'usage_count',
      header: 'Usage',
      render: (_: any, row: Coupon) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {row.usage_count}{row.usage_limit ? ` / ${row.usage_limit}` : ''}
        </span>
      ),
    },
    {
      key: 'expires_at',
      header: 'Expires',
      render: (value: string | null) => (
        <span className="text-sm text-neutral-500">
          {value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value: boolean, row: Coupon) => {
        const isExpired = row.usage_limit !== null && row.usage_count >= row.usage_limit;
        return (
          <Badge variant={isExpired ? 'error' : value ? 'success' : 'default'} size="sm">
            {isExpired ? 'Exhausted' : value ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      width: 80,
      render: (_: any, row: Coupon) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={() => openEdit(row)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="xs" onClick={() => toast.success('Coupon deleted')}>
            <Trash2 className="w-4 h-4 text-error-500" />
          </Button>
        </div>
      ),
    },
  ], [openEdit]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Coupons"
        description="Manage discount codes and promotions"
        actions={
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Create Coupon
          </Button>
        }
      />

      <motion.div variants={fadeInUp}>
        <Input
          placeholder="Search coupons..."
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
          pagination
          pageSize={20}
          hoverable
        />
      </motion.div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={isEditing ? 'Edit Coupon' : 'Create Coupon'} size="lg">
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Coupon Code"
              value={editCoupon.code || ''}
              onChange={(e) => setEditCoupon((c) => ({ ...c, code: e.target.value.toUpperCase() }))}
              placeholder="e.g., SAVE20"
              isRequired
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Discount Type</label>
              <select
                value={editCoupon.discount_type || 'percentage'}
                onChange={(e) => setEditCoupon((c) => ({ ...c, discount_type: e.target.value as DiscountType }))}
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="free_shipping">Free Shipping</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
              </select>
            </div>
          </div>

          <Input
            label="Description"
            value={editCoupon.description || ''}
            onChange={(e) => setEditCoupon((c) => ({ ...c, description: e.target.value }))}
            placeholder="Coupon description"
          />

          {editCoupon.discount_type !== 'free_shipping' && (
            <Input
              label="Discount Value"
              value={editCoupon.discount_value || ''}
              onChange={(e) => setEditCoupon((c) => ({ ...c, discount_value: e.target.value }))}
              placeholder={editCoupon.discount_type === 'percentage' ? 'e.g., 10' : 'e.g., 20.00'}
              leftAddon={editCoupon.discount_type === 'fixed_amount' ? '$' : undefined}
              rightAddon={editCoupon.discount_type === 'percentage' ? '%' : undefined}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Order Amount"
              value={editCoupon.minimum_order_amount || ''}
              onChange={(e) => setEditCoupon((c) => ({ ...c, minimum_order_amount: e.target.value || null }))}
              placeholder="Optional"
              leftAddon="$"
            />
            <Input
              label="Maximum Discount"
              value={editCoupon.maximum_discount || ''}
              onChange={(e) => setEditCoupon((c) => ({ ...c, maximum_discount: e.target.value || null }))}
              placeholder="Optional"
              leftAddon="$"
            />
          </div>

          <Input
            label="Usage Limit"
            type="number"
            value={editCoupon.usage_limit ?? ''}
            onChange={(e) => setEditCoupon((c) => ({ ...c, usage_limit: e.target.value ? parseInt(e.target.value) : null }))}
            placeholder="Unlimited"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Starts At"
              type="date"
              value={editCoupon.starts_at ? editCoupon.starts_at.split('T')[0] : ''}
              onChange={(e) => setEditCoupon((c) => ({ ...c, starts_at: e.target.value ? `${e.target.value}T00:00:00Z` : null }))}
            />
            <Input
              label="Expires At"
              type="date"
              value={editCoupon.expires_at ? editCoupon.expires_at.split('T')[0] : ''}
              onChange={(e) => setEditCoupon((c) => ({ ...c, expires_at: e.target.value ? `${e.target.value}T23:59:59Z` : null }))}
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>
            {isEditing ? 'Update' : 'Create'} Coupon
          </Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}
