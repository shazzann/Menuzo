import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, ExternalLink, Calendar, Building2, Receipt, User, Store } from 'lucide-react';

export function PaymentReviewDialog({ 
  payment, 
  open, 
  onOpenChange,
  onStatusChanged
}: { 
  payment: any; // PopulatedPaymentRequest
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onStatusChanged: () => void;
}) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!payment) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const { data, error } = await supabase.rpc('approve_payment', {
        p_payment_id: payment.id
      });
      
      if (error) throw error;
      
      const result = data as any;
      if (result && !result.success) {
        throw new Error(result.message || 'Approval failed');
      }

      console.log('Approved payment', payment.id);
      toast.success('Payment approved and subscription activated!');
      onStatusChanged();
      onOpenChange(false);
    } catch (err: any) {
      toast.error('Failed to approve: ' + err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }
    
    setIsRejecting(true);
    try {
      const { data, error } = await supabase.rpc('reject_payment', {
        p_payment_id: payment.id,
        p_reason: rejectionReason
      });
      
      if (error) throw error;
      
      const result = data as any;
      if (result && !result.success) {
        throw new Error(result.message || 'Rejection failed');
      }

      console.log('Rejected payment', payment.id);
      toast.success('Payment rejected successfully.');
      onStatusChanged();
      onOpenChange(false);
    } catch (err: any) {
      toast.error('Failed to reject: ' + err.message);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShowRejectForm(false);
      setRejectionReason('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="w-5 h-5 text-primary" />
            Review Payment Request
          </DialogTitle>
          <DialogDescription>
            Verify the payment details and proof before approving the subscription.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          
          {/* Status Banner */}
          <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status</span>
              <span className="capitalize font-medium flex items-center gap-1.5">
                {payment.status === 'pending' && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                {payment.status === 'approved' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                {payment.status === 'rejected' && <span className="w-2 h-2 rounded-full bg-red-500" />}
                {payment.status}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Amount</span>
              <span className="font-bold text-lg text-emerald-500">
                {payment.amount.toLocaleString()} {payment.currency}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="space-y-3 p-4 bg-card border border-border/50 rounded-xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground pb-2 border-b border-border/50">
                <User className="w-4 h-4" /> Customer Details
              </div>
              <div className="grid gap-1 text-sm">
                <div className="text-muted-foreground">Email</div>
                <div className="font-medium truncate" title={payment.shop_owner_email}>{payment.shop_owner_email}</div>
                <div className="text-muted-foreground mt-2">Submitted On</div>
                <div className="font-medium">{new Date(payment.submitted_at).toLocaleString()}</div>
              </div>
            </div>

            {/* Shop Details */}
            <div className="space-y-3 p-4 bg-card border border-border/50 rounded-xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground pb-2 border-b border-border/50">
                <Store className="w-4 h-4" /> Shop Details
              </div>
              <div className="grid gap-1 text-sm">
                <div className="text-muted-foreground">Shop Name</div>
                <div className="font-medium truncate" title={payment.shop_name}>{payment.shop_name}</div>
                <div className="text-muted-foreground mt-2">Requested Plan</div>
                <div className="font-medium capitalize">{payment.plan_id} Plan</div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-3 p-4 bg-card border border-border/50 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground pb-2 border-b border-border/50">
              <Building2 className="w-4 h-4" /> Payment Info
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Reference Number</div>
                <div className="font-mono bg-muted/50 p-2 rounded border border-border/50 inline-block break-all">
                  {payment.reference || 'No reference provided'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Proof of Payment</div>
                {payment.proof_url ? (
                  <a 
                    href={payment.proof_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm gap-2 w-full"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Receipt
                  </a>
                ) : (
                  <div className="text-muted-foreground italic h-9 flex items-center">No proof uploaded</div>
                )}
              </div>
            </div>
          </div>

          {/* Rejection Reason display if already rejected */}
          {payment.status === 'rejected' && payment.rejection_reason && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-500 pb-1">
                <XCircle className="w-4 h-4" /> Rejection Reason
              </div>
              <p className="text-sm text-red-500/90">{payment.rejection_reason}</p>
            </div>
          )}

          {/* Actions */}
          {payment.status === 'pending' && !showRejectForm && (
            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button 
                variant="outline" 
                className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30"
                onClick={() => setShowRejectForm(true)}
                disabled={isApproving}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Payment
              </Button>
              <Button 
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={handleApprove}
                disabled={isApproving}
              >
                {isApproving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Approve & Activate
              </Button>
            </div>
          )}

          {showRejectForm && (
            <div className="pt-4 border-t border-border/50 space-y-3 animate-fade-in-up">
              <label className="text-sm font-medium text-red-500">Reason for Rejection</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g. Proof of payment is unreadable..."
                className="w-full px-3 py-2 bg-muted/30 border border-red-500/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none h-24"
              />
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  className="flex-1 hover:bg-muted/50"
                  onClick={() => setShowRejectForm(false)}
                  disabled={isRejecting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={handleReject}
                  disabled={isRejecting || !rejectionReason.trim()}
                >
                  {isRejecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Confirm Rejection
                </Button>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
