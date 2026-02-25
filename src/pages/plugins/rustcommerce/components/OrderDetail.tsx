import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, CreditCard, Truck, Package,
  Clock, CheckCircle, XCircle, RotateCcw, Printer,
} from 'lucide-react';
import {
  PageHeader, Card, CardBody, CardHeader, Button, Badge,
} from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import toast from 'react-hot-toast';
import type { Order, OrderStatus, OrderItem } from '../types';

const statusVariant: Record<OrderStatus, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'error',
};

const statusIcon: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  processing: <Package className="w-4 h-4" />,
  shipped: <Truck className="w-4 h-4" />,
  delivered: <CheckCircle className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
  refunded: <RotateCcw className="w-4 h-4" />,
};

const mockOrder: Order = {
  id: '1', order_number: 'ORD-1024', customer_id: 'c1', customer_email: 'john@example.com',
  customer_name: 'John Smith', status: 'processing', payment_status: 'completed',
  subtotal: '298.98', tax_total: '23.92', shipping_total: '9.99', discount_total: '0.00',
  grand_total: '332.89', currency: 'USD',
  shipping_address: { id: 'a1', first_name: 'John', last_name: 'Smith', company: 'Acme Inc', address_line1: '123 Main Street', address_line2: 'Apt 4B', city: 'Austin', state: 'TX', postal_code: '78701', country: 'US', phone: '+1 512-555-0123', is_default: true },
  billing_address: { id: 'a2', first_name: 'John', last_name: 'Smith', company: 'Acme Inc', address_line1: '123 Main Street', address_line2: 'Apt 4B', city: 'Austin', state: 'TX', postal_code: '78701', country: 'US', phone: '+1 512-555-0123', is_default: true },
  items: [
    { id: 'oi1', order_id: '1', product_id: 'p1', variant_id: 'v1', product_name: 'Premium Wireless Headphones', variant_name: 'Black', sku: 'WH-001-BLK', quantity: 1, unit_price: '149.99', total_price: '149.99' },
    { id: 'oi2', order_id: '1', product_id: 'p2', variant_id: null, product_name: 'Smart Watch Pro', variant_name: null, sku: 'SW-002', quantity: 1, unit_price: '148.99', total_price: '148.99' },
  ],
  notes: 'Please deliver between 9am-5pm',
  coupon_code: null,
  created_at: '2024-12-14T10:30:00Z', updated_at: '2024-12-14T10:30:00Z',
};

const timeline = [
  { status: 'Order placed', date: '2024-12-14T10:30:00Z', description: 'Order received and confirmed' },
  { status: 'Payment confirmed', date: '2024-12-14T10:31:00Z', description: 'Payment of $332.89 via Stripe' },
  { status: 'Processing', date: '2024-12-14T11:00:00Z', description: 'Order is being prepared' },
];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order>(mockOrder);
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);

  const handleStatusUpdate = () => {
    setOrder((o) => ({ ...o, status: newStatus }));
    toast.success(`Order status updated to ${newStatus}`);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title={`Order ${order.order_number}`}
        description={`Placed on ${new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/store/orders')}>
              Back
            </Button>
            <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />}>
              Print
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Header */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {statusIcon[order.status]}
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Order Status</p>
                      <Badge variant={statusVariant[order.status]} size="md">{order.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <Button variant="primary" size="sm" onClick={handleStatusUpdate}>
                      Update
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Items Table */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Order Items</h3>
              </CardHeader>
              <CardBody padding="none">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">SKU</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Qty</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-neutral-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-neutral-900 dark:text-white">{item.product_name}</p>
                                {item.variant_name && (
                                  <p className="text-xs text-neutral-500">{item.variant_name}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-500">{item.sku}</td>
                          <td className="px-6 py-4 text-sm text-neutral-900 dark:text-white text-right">${item.unit_price}</td>
                          <td className="px-6 py-4 text-sm text-neutral-900 dark:text-white text-right">{item.quantity}</td>
                          <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white text-right">${item.total_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="border-t border-neutral-200 dark:border-neutral-700 px-6 py-4">
                  <div className="max-w-xs ml-auto space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Subtotal</span>
                      <span className="text-neutral-900 dark:text-white">${order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Shipping</span>
                      <span className="text-neutral-900 dark:text-white">${order.shipping_total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Tax</span>
                      <span className="text-neutral-900 dark:text-white">${order.tax_total}</span>
                    </div>
                    {parseFloat(order.discount_total) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Discount</span>
                        <span className="text-success-600">-${order.discount_total}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-semibold pt-2 border-t border-neutral-200 dark:border-neutral-700">
                      <span className="text-neutral-900 dark:text-white">Total</span>
                      <span className="text-neutral-900 dark:text-white">${order.grand_total}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Order Timeline</h3>
              </CardHeader>
              <CardBody>
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-neutral-200 dark:bg-neutral-700"></div>
                  <div className="space-y-6">
                    {timeline.map((event, i) => (
                      <div key={i} className="flex gap-4 relative">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 z-10">
                          <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="pt-1">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">{event.status}</p>
                          <p className="text-xs text-neutral-500">{event.description}</p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Customer</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">
                    {order.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{order.customer_name}</p>
                    <p className="text-xs text-neutral-500">{order.customer_email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate(`/store/customers/${order.customer_id}`)}>
                  View Customer
                </Button>
              </CardBody>
            </Card>
          </motion.div>

          {/* Payment */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-neutral-500" />
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Payment</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Status</span>
                  <Badge variant={order.payment_status === 'completed' ? 'success' : 'warning'} size="sm">
                    {order.payment_status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Method</span>
                  <span className="text-neutral-900 dark:text-white">Stripe</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Amount</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">${order.grand_total}</span>
                </div>
                {order.coupon_code && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Coupon</span>
                    <Badge variant="info" size="xs">{order.coupon_code}</Badge>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Shipping Address */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-neutral-500" />
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Shipping Address</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                  </p>
                  {order.shipping_address.company && <p>{order.shipping_address.company}</p>}
                  <p>{order.shipping_address.address_line1}</p>
                  {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                  <p>{order.shipping_address.country}</p>
                  {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Billing Address */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-500" />
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Billing Address</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {order.billing_address.first_name} {order.billing_address.last_name}
                  </p>
                  {order.billing_address.company && <p>{order.billing_address.company}</p>}
                  <p>{order.billing_address.address_line1}</p>
                  {order.billing_address.address_line2 && <p>{order.billing_address.address_line2}</p>}
                  <p>{order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}</p>
                  <p>{order.billing_address.country}</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Notes */}
          {order.notes && (
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Notes</h3>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{order.notes}</p>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
