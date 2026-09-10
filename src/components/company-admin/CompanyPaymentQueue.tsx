import { useState, useEffect } from 'react';
import { useApp } from '@/store';
import { supabase } from '@/lib/supabase';
import type { PaymentRequest } from '@/types';
import { Search, Filter, RefreshCw, CheckCircle2, XCircle, Eye, CreditCard, Clock, ChevronDown } from 'lucide-react';
import { PaymentReviewDialog } from './PaymentReviewDialog';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
};

interface PopulatedPaymentRequest extends PaymentRequest {
  shop_name: string;
  shop_owner_email: string;
}

export function CompanyPaymentQueue() {
  const { dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [payments, setPayments] = useState<PopulatedPaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PopulatedPaymentRequest | null>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select(`
          *,
          shops:shop_id (name),
          profiles:profile_id (email)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const mapped = ((data as any) || []).map((p: any) => ({
        ...p,
        shop_name: Array.isArray(p.shops) ? p.shops[0]?.name : (p.shops?.name || 'Unknown Shop'),
        shop_owner_email: Array.isArray(p.profiles) ? p.profiles[0]?.email : (p.profiles?.email || 'Unknown User'),
      }));

      setPayments(mapped);
    } catch (err: any) {
      console.error('Failed to fetch payments', err);
      setError(err.message || 'Failed to fetch payment requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = payments.filter((p) => {
    const matchSearch = p.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shop_owner_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Queue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} requests found</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchPayments}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by shop, email, or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-muted/30 border border-border/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading payment queue...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/50 rounded-2xl bg-card/30">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Queue is empty</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {searchQuery || statusFilter !== 'all' 
              ? "No payments match your current filters."
              : "All caught up! There are no pending payment requests."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/30 border-b border-border/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Shop / User</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Plan</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Reference</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Submitted</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{payment.shop_name}</div>
                      <div className="text-xs text-muted-foreground">{payment.shop_owner_email}</div>
                    </td>
                    <td className="px-4 py-3 capitalize font-medium">{payment.plan_id}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-500">
                      {payment.amount.toLocaleString()} {payment.currency}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {payment.reference || '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(payment.submitted_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[payment.status]}`}>
                        {payment.status === 'pending' && <Clock className="w-3 h-3" />}
                        {payment.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {payment.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        <span className="capitalize">{payment.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedPayment(payment)}
                        className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Dialog */}
      <PaymentReviewDialog
        payment={selectedPayment}
        open={!!selectedPayment}
        onOpenChange={(open) => !open && setSelectedPayment(null)}
        onStatusChanged={fetchPayments}
      />
    </div>
  );
}
