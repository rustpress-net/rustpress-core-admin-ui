import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Check, X, Trash2, Search, ShieldCheck,
} from 'lucide-react';
import { PageHeader, Card, CardBody, Button, Badge, Input } from '@/design-system';
import { staggerContainer, fadeInUp } from '@/design-system';
import toast from 'react-hot-toast';
import type { Review, ReviewStatus } from '../types';

const mockReviews: Review[] = [
  { id: 'r1', product_id: 'p1', customer_id: 'c1', customer_name: 'John Smith', rating: 5, title: 'Amazing headphones!', content: 'Best wireless headphones I\'ve ever owned. The noise cancellation is incredible and the sound quality is superb. Battery lasts all day.', status: 'approved', verified_purchase: true, created_at: '2024-12-12T14:30:00Z' },
  { id: 'r2', product_id: 'p2', customer_id: 'c2', customer_name: 'Emma Wilson', rating: 4, title: 'Great smart watch', content: 'Really enjoying this watch. The fitness tracking is accurate and the display is beautiful. Only complaint is the band could be more comfortable.', status: 'approved', verified_purchase: true, created_at: '2024-12-11T09:15:00Z' },
  { id: 'r3', product_id: 'p3', customer_id: 'c3', customer_name: 'Mike Chen', rating: 3, title: 'Decent quality', content: 'The shirt is okay but I expected better for the price. Fabric is a bit thin. Fits true to size though.', status: 'pending', verified_purchase: true, created_at: '2024-12-13T16:00:00Z' },
  { id: 'r4', product_id: 'p1', customer_id: 'c4', customer_name: 'Sarah Johnson', rating: 1, title: 'Terrible product', content: 'Stopped working after 2 weeks. Complete waste of money. Customer support was unhelpful.', status: 'pending', verified_purchase: false, created_at: '2024-12-14T08:45:00Z' },
  { id: 'r5', product_id: 'p5', customer_id: 'c5', customer_name: 'Alex Kim', rating: 5, title: 'Perfect portable speaker', content: 'Excellent sound for such a small speaker. Waterproof feature works great. Take it everywhere!', status: 'pending', verified_purchase: true, created_at: '2024-12-14T11:20:00Z' },
  { id: 'r6', product_id: 'p4', customer_id: 'c6', customer_name: 'Lisa Park', rating: 4, title: 'Beautiful bag', content: 'The leather quality is outstanding. Looks even better in person. Perfect for daily use.', status: 'rejected', verified_purchase: true, created_at: '2024-12-10T13:00:00Z' },
];

const productNames: Record<string, string> = {
  p1: 'Premium Wireless Headphones',
  p2: 'Smart Watch Pro',
  p3: 'Organic Cotton T-Shirt',
  p4: 'Leather Messenger Bag',
  p5: 'Bluetooth Speaker',
};

const statusVariant: Record<ReviewStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 dark:text-neutral-600'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewModeration() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
  const [reviews, setReviews] = useState(mockReviews);

  const filtered = useMemo(() => {
    let list = reviews;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.customer_name.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }
    return list;
  }, [reviews, search, statusFilter]);

  const handleApprove = (id: string) => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved' as ReviewStatus } : r));
    toast.success('Review approved');
  };

  const handleReject = (id: string) => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: 'rejected' as ReviewStatus } : r));
    toast.success('Review rejected');
  };

  const handleDelete = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast.success('Review deleted');
  };

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Reviews"
        description={pendingCount > 0 ? `${pendingCount} reviews pending moderation` : 'All reviews moderated'}
      />

      {/* Filters */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardBody>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search reviews..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  isClearable
                  onClear={() => setSearch('')}
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
                  <Button
                    key={s}
                    variant={statusFilter === s ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setStatusFilter(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                    {s === 'pending' && pendingCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.map((review) => (
          <motion.div key={review.id} variants={fadeInUp}>
            <Card variant="default" className="hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold flex-shrink-0">
                    {review.customer_name.charAt(0)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {review.customer_name}
                          </span>
                          {review.verified_purchase && (
                            <Badge variant="success" size="xs" icon={<ShieldCheck className="w-3 h-3" />}>
                              Verified
                            </Badge>
                          )}
                          <Badge variant={statusVariant[review.status]} size="xs">
                            {review.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          on {productNames[review.product_id] || 'Unknown Product'} &middot;{' '}
                          {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>

                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mt-2">
                      {review.title}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {review.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      {review.status === 'pending' && (
                        <>
                          <Button variant="success" size="xs" leftIcon={<Check className="w-3.5 h-3.5" />} onClick={() => handleApprove(review.id)}>
                            Approve
                          </Button>
                          <Button variant="danger" size="xs" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => handleReject(review.id)}>
                            Reject
                          </Button>
                        </>
                      )}
                      {review.status === 'rejected' && (
                        <Button variant="success" size="xs" leftIcon={<Check className="w-3.5 h-3.5" />} onClick={() => handleApprove(review.id)}>
                          Approve
                        </Button>
                      )}
                      {review.status === 'approved' && (
                        <Button variant="ghost" size="xs" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => handleReject(review.id)}>
                          Reject
                        </Button>
                      )}
                      <Button variant="ghost" size="xs" onClick={() => handleDelete(review.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-error-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">No reviews found</p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
