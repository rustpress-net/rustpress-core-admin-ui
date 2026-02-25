import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Save, ArrowLeft, Plus, Trash2, GripVertical, Upload, Image as ImageIcon, X,
} from 'lucide-react';
import {
  PageHeader, Card, CardBody, CardHeader, Button, Input, Badge,
  Tabs, TabList, Tab, TabPanel, TabPanels, Switch,
} from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import toast from 'react-hot-toast';
import type { Product, ProductVariant, ProductImage } from '../types';

const emptyProduct: Partial<Product> = {
  name: '', slug: '', description: '', short_description: '',
  sku: '', price: '', compare_at_price: null, cost_price: null,
  status: 'draft', featured: false, weight: null,
  category_ids: [], tags: [],
  stock_quantity: 0, low_stock_threshold: 10,
  track_inventory: true, allow_backorders: false,
  images: [], variants: [],
};

export default function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [product, setProduct] = useState<Partial<Product>>(emptyProduct);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // In real app, fetch product by id
  useEffect(() => {
    if (id) {
      // Mock: would fetch from API
      setProduct({
        id,
        name: 'Premium Wireless Headphones',
        slug: 'premium-wireless-headphones',
        description: 'High-quality wireless headphones with active noise cancellation, premium sound quality, and all-day comfort. Features include 30-hour battery life, quick charge, and multi-device connectivity.',
        short_description: 'Premium audio experience with ANC',
        sku: 'WH-001',
        price: '149.99',
        compare_at_price: '199.99',
        cost_price: '65.00',
        status: 'published',
        featured: true,
        weight: 0.3,
        category_ids: ['1'],
        tags: ['electronics', 'audio', 'wireless'],
        stock_quantity: 45,
        low_stock_threshold: 10,
        track_inventory: true,
        allow_backorders: false,
        images: [],
        variants: [
          { id: 'v1', product_id: id, name: 'Black', sku: 'WH-001-BLK', price: '149.99', stock_quantity: 20, option_name: 'Color', option_value: 'Black', weight: 0.3, is_default: true },
          { id: 'v2', product_id: id, name: 'White', sku: 'WH-001-WHT', price: '149.99', stock_quantity: 15, option_name: 'Color', option_value: 'White', weight: 0.3, is_default: false },
          { id: 'v3', product_id: id, name: 'Navy', sku: 'WH-001-NAV', price: '159.99', stock_quantity: 10, option_name: 'Color', option_value: 'Navy', weight: 0.3, is_default: false },
        ],
        created_at: '2024-12-01T00:00:00Z',
        updated_at: '2024-12-14T00:00:00Z',
      });
    }
  }, [id]);

  const updateField = useCallback((field: string, value: any) => {
    setProduct((p) => ({ ...p, [field]: value }));
  }, []);

  const generateSlug = useCallback(() => {
    const slug = (product.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    updateField('slug', slug);
  }, [product.name, updateField]);

  const handleSave = useCallback(async (publish = false) => {
    setSaving(true);
    try {
      if (publish) {
        updateField('status', 'published');
      }
      // Mock save
      await new Promise((r) => setTimeout(r, 500));
      toast.success(isNew ? 'Product created successfully' : 'Product updated successfully');
      if (isNew) navigate('/store/products');
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  }, [isNew, navigate, updateField]);

  const addVariant = useCallback(() => {
    const newVariant: ProductVariant = {
      id: `v-${Date.now()}`,
      product_id: product.id || '',
      name: '',
      sku: '',
      price: product.price || '0',
      stock_quantity: 0,
      option_name: '',
      option_value: '',
      weight: null,
      is_default: false,
    };
    setProduct((p) => ({ ...p, variants: [...(p.variants || []), newVariant] }));
  }, [product.id, product.price]);

  const updateVariant = useCallback((index: number, field: string, value: any) => {
    setProduct((p) => {
      const variants = [...(p.variants || [])];
      variants[index] = { ...variants[index], [field]: value };
      return { ...p, variants };
    });
  }, []);

  const removeVariant = useCallback((index: number) => {
    setProduct((p) => ({
      ...p,
      variants: (p.variants || []).filter((_, i) => i !== index),
    }));
  }, []);

  const addTag = useCallback(() => {
    if (tagInput.trim() && !(product.tags || []).includes(tagInput.trim())) {
      setProduct((p) => ({ ...p, tags: [...(p.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  }, [tagInput, product.tags]);

  const removeTag = useCallback((tag: string) => {
    setProduct((p) => ({ ...p, tags: (p.tags || []).filter((t) => t !== tag) }));
  }, []);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title={isNew ? 'New Product' : 'Edit Product'}
        description={isNew ? 'Create a new product for your store' : product.name}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/store/products')}>
              Back
            </Button>
            <Button variant="outline" leftIcon={<Save className="w-4 h-4" />} onClick={() => handleSave(false)} isLoading={saving}>
              Save Draft
            </Button>
            <Button variant="primary" onClick={() => handleSave(true)} isLoading={saving}>
              {product.status === 'published' ? 'Update' : 'Publish'}
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab value="general">General</Tab>
          <Tab value="inventory">Inventory</Tab>
          <Tab value="variants">Variants</Tab>
          <Tab value="images">Images</Tab>
          <Tab value="seo">SEO</Tab>
        </TabList>

        <TabPanels>
          {/* General Tab */}
          <TabPanel value="general">
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardBody className="space-y-4">
                    <Input
                      label="Product Name"
                      value={product.name || ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      onBlur={() => { if (!product.slug) generateSlug(); }}
                      placeholder="Enter product name"
                      isRequired
                    />
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          label="Slug"
                          value={product.slug || ''}
                          onChange={(e) => updateField('slug', e.target.value)}
                          placeholder="product-slug"
                        />
                      </div>
                      <Button variant="ghost" size="sm" onClick={generateSlug}>Generate</Button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Short Description
                      </label>
                      <textarea
                        value={product.short_description || ''}
                        onChange={(e) => updateField('short_description', e.target.value)}
                        placeholder="Brief product summary..."
                        rows={2}
                        className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={product.description || ''}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Full product description..."
                        rows={6}
                        className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all resize-none"
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Pricing</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Price"
                        value={product.price || ''}
                        onChange={(e) => updateField('price', e.target.value)}
                        placeholder="0.00"
                        leftAddon="$"
                        isRequired
                      />
                      <Input
                        label="Compare at Price"
                        value={product.compare_at_price || ''}
                        onChange={(e) => updateField('compare_at_price', e.target.value || null)}
                        placeholder="0.00"
                        leftAddon="$"
                      />
                      <Input
                        label="Cost Price"
                        value={product.cost_price || ''}
                        onChange={(e) => updateField('cost_price', e.target.value || null)}
                        placeholder="0.00"
                        leftAddon="$"
                      />
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Status</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <select
                      value={product.status || 'draft'}
                      onChange={(e) => updateField('status', e.target.value)}
                      className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                    <Switch
                      checked={product.featured || false}
                      onChange={(checked) => updateField('featured', checked)}
                      label="Featured Product"
                    />
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Tags</h3>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                        placeholder="Add tag..."
                        size="sm"
                      />
                      <Button variant="outline" size="sm" onClick={addTag}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(product.tags || []).map((tag) => (
                        <Badge key={tag} variant="default" removable onRemove={() => removeTag(tag)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Shipping</h3>
                  </CardHeader>
                  <CardBody>
                    <Input
                      label="Weight (kg)"
                      type="number"
                      value={product.weight ?? ''}
                      onChange={(e) => updateField('weight', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="0.00"
                    />
                  </CardBody>
                </Card>
              </div>
            </motion.div>
          </TabPanel>

          {/* Inventory Tab */}
          <TabPanel value="inventory">
            <motion.div variants={fadeInUp} className="max-w-2xl mt-6">
              <Card>
                <CardHeader>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Inventory Management</h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  <Input
                    label="SKU"
                    value={product.sku || ''}
                    onChange={(e) => updateField('sku', e.target.value)}
                    placeholder="Enter SKU"
                  />
                  <Switch
                    checked={product.track_inventory || false}
                    onChange={(checked) => updateField('track_inventory', checked)}
                    label="Track Inventory"
                    description="Enable stock management for this product"
                  />
                  {product.track_inventory && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Stock Quantity"
                          type="number"
                          value={product.stock_quantity ?? 0}
                          onChange={(e) => updateField('stock_quantity', parseInt(e.target.value) || 0)}
                        />
                        <Input
                          label="Low Stock Threshold"
                          type="number"
                          value={product.low_stock_threshold ?? 10}
                          onChange={(e) => updateField('low_stock_threshold', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <Switch
                        checked={product.allow_backorders || false}
                        onChange={(checked) => updateField('allow_backorders', checked)}
                        label="Allow Backorders"
                        description="Allow customers to order when out of stock"
                      />
                    </>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          </TabPanel>

          {/* Variants Tab */}
          <TabPanel value="variants">
            <motion.div variants={fadeInUp} className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {(product.variants || []).length} variant(s)
                </p>
                <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addVariant}>
                  Add Variant
                </Button>
              </div>
              {(product.variants || []).length === 0 ? (
                <Card>
                  <CardBody>
                    <div className="text-center py-8">
                      <p className="text-neutral-500 dark:text-neutral-400 mb-4">No variants yet. Add variants for different options like size or color.</p>
                      <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addVariant}>
                        Add First Variant
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <Card>
                  <CardBody padding="none">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-neutral-200 dark:border-neutral-700">
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Option</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Value</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">SKU</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Stock</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Default</th>
                            <th className="px-4 py-3 w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                          {(product.variants || []).map((variant, i) => (
                            <tr key={variant.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={variant.option_name}
                                  onChange={(e) => updateVariant(i, 'option_name', e.target.value)}
                                  placeholder="e.g., Color"
                                  className="w-full px-2 py-1 text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={variant.option_value}
                                  onChange={(e) => updateVariant(i, 'option_value', e.target.value)}
                                  placeholder="e.g., Blue"
                                  className="w-full px-2 py-1 text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={variant.sku}
                                  onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                                  placeholder="SKU"
                                  className="w-full px-2 py-1 text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  value={variant.price}
                                  onChange={(e) => updateVariant(i, 'price', e.target.value)}
                                  placeholder="0.00"
                                  className="w-24 px-2 py-1 text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  value={variant.stock_quantity}
                                  onChange={(e) => updateVariant(i, 'stock_quantity', parseInt(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="radio"
                                  name="default_variant"
                                  checked={variant.is_default}
                                  onChange={() => {
                                    (product.variants || []).forEach((_, idx) => {
                                      updateVariant(idx, 'is_default', idx === i);
                                    });
                                  }}
                                  className="w-4 h-4 text-primary-600"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <Button variant="ghost" size="xs" onClick={() => removeVariant(i)}>
                                  <Trash2 className="w-4 h-4 text-error-500" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardBody>
                </Card>
              )}
            </motion.div>
          </TabPanel>

          {/* Images Tab */}
          <TabPanel value="images">
            <motion.div variants={fadeInUp} className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Product Images</h3>
                </CardHeader>
                <CardBody>
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-8 text-center hover:border-primary-500 dark:hover:border-primary-400 transition-colors cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto text-neutral-400 mb-3" />
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Drop images here or click to upload
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      PNG, JPG, WebP up to 5MB each
                    </p>
                  </div>

                  {/* Image Grid */}
                  {(product.images || []).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                      {(product.images || []).map((img) => (
                        <div key={img.id} className="relative aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden group">
                          <ImageIcon className="w-8 h-8 text-neutral-400 absolute inset-0 m-auto" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button variant="ghost" size="xs" className="text-white">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          {img.is_primary && (
                            <Badge variant="primary" size="xs" className="absolute top-2 left-2">
                              Primary
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          </TabPanel>

          {/* SEO Tab */}
          <TabPanel value="seo">
            <motion.div variants={fadeInUp} className="max-w-2xl mt-6">
              <Card>
                <CardHeader>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">SEO Settings</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <Input
                    label="Meta Title"
                    value={product.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="SEO title"
                    helperText={`${(product.name || '').length}/60 characters`}
                  />
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={product.short_description || ''}
                      onChange={(e) => updateField('short_description', e.target.value)}
                      placeholder="SEO meta description..."
                      rows={3}
                      className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all resize-none"
                    />
                    <p className="text-xs text-neutral-500 mt-1">{(product.short_description || '').length}/160 characters</p>
                  </div>
                  <Input
                    label="URL Slug"
                    value={product.slug || ''}
                    onChange={(e) => updateField('slug', e.target.value)}
                    leftAddon="/products/"
                  />

                  {/* SEO Preview */}
                  <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <p className="text-xs text-neutral-500 mb-2">Search Engine Preview</p>
                    <p className="text-lg text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer">
                      {product.name || 'Product Title'}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      example.com/products/{product.slug || 'product-slug'}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {product.short_description || 'Product description will appear here...'}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </motion.div>
  );
}
