import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
const ProductList = React.lazy(() => import('./components/ProductList'));
const ProductEditor = React.lazy(() => import('./components/ProductEditor'));
const OrderList = React.lazy(() => import('./components/OrderList'));
const OrderDetail = React.lazy(() => import('./components/OrderDetail'));
const CustomerList = React.lazy(() => import('./components/CustomerList'));
const CustomerDetail = React.lazy(() => import('./components/CustomerDetail'));
const CouponManager = React.lazy(() => import('./components/CouponManager'));
const ReviewModeration = React.lazy(() => import('./components/ReviewModeration'));
const GeneralSettings = React.lazy(() => import('./components/settings/GeneralSettings'));
const PaymentSettings = React.lazy(() => import('./components/settings/PaymentSettings'));
const ShippingSettings = React.lazy(() => import('./components/settings/ShippingSettings'));
const TaxSettings = React.lazy(() => import('./components/settings/TaxSettings'));
const EmailSettings = React.lazy(() => import('./components/settings/EmailSettings'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

export default function RustCommerceRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductEditor />} />
        <Route path="products/:id" element={<ProductEditor />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="coupons" element={<CouponManager />} />
        <Route path="reviews" element={<ReviewModeration />} />
        <Route path="settings" element={<Navigate to="settings/general" replace />} />
        <Route path="settings/general" element={<GeneralSettings />} />
        <Route path="settings/payments" element={<PaymentSettings />} />
        <Route path="settings/shipping" element={<ShippingSettings />} />
        <Route path="settings/tax" element={<TaxSettings />} />
        <Route path="settings/email" element={<EmailSettings />} />
      </Routes>
    </Suspense>
  );
}
