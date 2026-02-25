import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Search, Filter, Trash2, Eye, Edit, MoreHorizontal,
  Package, Archive, CheckCircle, FileText,
} from 'lucide-react';
import {
  PageHeader, Card, CardBody, Button, Badge, DataTable, Input,
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
} from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import type { Product, ProductStatus } from '../types';

// Mock products
const mockProducts: Product[] = [
  {
    id: '1', name: 'Premium Wireless Headphones', slug: 'premium-wireless-headphones',
    description: 'High quality headphones', short_description: 'Premium audio', sku: 'WH-001',
    price: '149.99', compare_at_price: '199.99', cost_price: '65.00',
    status: 'published', featured: true, weight: 0.3, category_ids: ['1'], tags: ['electronics', 'audio'],
    stock_quantity: 45, low_stock_threshold: 10, track_inventory: true, allow_backorders: false,
    images: [{ id: 'i1', product_id: '1', url: '', alt_text: 'Headphones', position: 0, is_primary: true }],
    variants: [],
    created_at: '2024-12-01T00:00:00Z', updated_at: '2024-12-14T00:00:00Z',
  },
  {
    id: '2', name: 'Smart Watch Pro', slug: 'smart-watch-pro',
    description: 'Latest smart watch', short_description: 'Smart watch', sku: 'SW-002',
    price: '299.99', compare_at_price: null, cost_price: '120.00',
    status: 'published', featured: true, weight: 0.15, category_ids: ['1'], tags: ['electronics', 'wearable'],
    stock_quantity: 23, low_stock_threshold: 5, track_inventory: true, allow_backorders: false,
    images: [], variants: [],
    created_at: '2024-12-02T00:00:00Z', updated_at: '2024-12-13T00:00:00Z',
  },
  {
    id: '3', name: 'Organic Cotton T-Shirt', slug: 'organic-cotton-tshirt',
    description: 'Comfortable organic cotton shirt', short_description: 'Soft tee', sku: 'TS-003',
    price: '29.99', compare_at_price: '39.99', cost_price: '8.50',
    status: 'published', featured: false, weight: 0.2, category_ids: ['2'], tags: ['clothing', 'organic'],
    stock_quantity: 156, low_stock_threshold: 20, track_inventory: true, allow_backorders: true,
    images: [], variants: [],
    created_at: '2024-11-15T00:00:00Z', updated_at: '2024-12-10T00:00:00Z',
  },
  {
    id: '4', name: 'Leather Messenger Bag', slug: 'leather-messenger-bag',
    description: 'Genuine leather bag', short_description: 'Leather bag', sku: 'LB-004',
    price: '189.00', compare_at_price: null, cost_price: '75.00',
    status: 'draft', featured: false, weight: 1.2, category_ids: ['3'], tags: ['accessories', 'leather'],
    stock_quantity: 8, low_stock_threshold: 5, track_inventory: true, allow_backorders: false,
    images: [], variants: [],
    created_at: '2024-12-05T00:00:00Z', updated_at: '2024-12-12T00:00:00Z',
  },
  {
    id: '5', name: 'Bluetooth Speaker', slug: 'bluetooth-speaker',
    description: 'Portable bluetooth speaker', short_description: 'BT Speaker', sku: 'BS-005',
    price: '79.99', compare_at_price: '99.99', cost_price: '30.00',
    status: 'published', featured: false, weight: 0.5, category_ids: ['1'], tags: ['electronics', 'audio'],
    stock_quantity: 67, low_stock_threshold: 15, track_inventory: true, allow_backorders: false,
    images: [], variants: [],
    created_at: '2024-11-20T00:00:00Z', updated_at: '2024-12-11T00:00:00Z',
  },
  {
    id: '6', name: 'Vintage Film Camera', slug: 'vintage-film-camera',
    description: 'Classic film camera', short_description: 'Film camera', sku: 'FC-006',
    price: '450.00', compare_at_price: null, cost_price: '200.00',
    status: 'archived', featured: false, weight: 0.8, category_ids: ['1'], tags: ['electronics', 'camera'],
    stock_quantity: 0, low_stock_threshold: 2, track_inventory: true, allow_backorders: false,
    images: [], variants: [],
    created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-30T00:00:00Z',
  },
];

const statusBadgeMap: Record<ProductStatus, 'success' | 'warning' | 'default'> = {
  published: 'success',
  draft: 'warning',
  archived: 'default',
};

export default function ProductList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const filteredProducts = useMemo(() => {
    let list = mockProducts;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }
    return list;
  }, [search, statusFilter]);

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (_: any, row: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{row.name}</p>
            <p className="text-xs text-neutral-500">{row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (_: any, row: Product) => (
        <div>
          <span className="text-sm font-medium text-neutral-900 dark:text-white">${row.price}</span>
          {row.compare_at_price && (
            <span className="ml-2 text-xs text-neutral-400 line-through">${row.compare_at_price}</span>
          )}
        </div>
      ),
    },
    {
      key: 'stock_quantity',
      header: 'Stock',
      sortable: true,
      render: (value: number, row: Product) => (
        <div>
          <span className={`text-sm font-medium ${
            value === 0 ? 'text-error-600 dark:text-error-400' :
            value <= row.low_stock_threshold ? 'text-warning-600 dark:text-warning-400' :
            'text-neutral-900 dark:text-white'
          }`}>
            {value}
          </span>
          {value <= row.low_stock_threshold && value > 0 && (
            <span className="ml-1 text-xs text-warning-500">Low</span>
          )}
          {value === 0 && (
            <span className="ml-1 text-xs text-error-500">Out</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: ProductStatus) => (
        <Badge variant={statusBadgeMap[value]} size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'updated_at',
      header: 'Updated',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-neutral-500">
          {new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: 50,
      render: (_: any, row: Product) => (
        <Dropdown>
          <DropdownTrigger>
            <Button variant="ghost" size="sm" iconOnly>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem onClick={() => navigate(`/store/products/${row.id}`)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </DropdownItem>
            <DropdownItem onClick={() => {}}>
              <Eye className="w-4 h-4 mr-2" /> View
            </DropdownItem>
            <DropdownItem onClick={() => {}}>
              <Trash2 className="w-4 h-4 mr-2 text-error-500" /> Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
    },
  ], [navigate]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Products"
        description={`${filteredProducts.length} products`}
        actions={
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/store/products/new')}>
            Add Product
          </Button>
        }
      />

      {/* Filters */}
      <motion.div variants={fadeInUp}>
        <Card variant="default">
          <CardBody>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search products by name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  isClearable
                  onClear={() => setSearch('')}
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'published', 'draft', 'archived'] as const).map((s) => (
                  <Button
                    key={s}
                    variant={statusFilter === s ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setStatusFilter(s)}
                    leftIcon={
                      s === 'published' ? <CheckCircle className="w-3.5 h-3.5" /> :
                      s === 'draft' ? <FileText className="w-3.5 h-3.5" /> :
                      s === 'archived' ? <Archive className="w-3.5 h-3.5" /> : undefined
                    }
                  >
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <motion.div variants={fadeInUp}>
          <Card variant="default">
            <CardBody>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {selectedIds.size} selected
                </span>
                <Button variant="ghost" size="sm" onClick={() => {}}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Publish
                </Button>
                <Button variant="ghost" size="sm" onClick={() => {}}>
                  <Archive className="w-4 h-4 mr-1" /> Archive
                </Button>
                <Button variant="danger" size="sm" onClick={() => {}}>
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                  Clear
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Table */}
      <motion.div variants={fadeInUp}>
        <DataTable
          data={filteredProducts}
          columns={columns}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(row) => navigate(`/store/products/${row.id}`)}
          pagination
          pageSize={20}
          hoverable
        />
      </motion.div>
    </motion.div>
  );
}
