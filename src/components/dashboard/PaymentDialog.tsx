import { useState } from 'react';
import { useApp } from '@/store';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Receipt, Building2, CheckCircle2, MessageCircle } from 'lucide-react';
import { PricingService } from '@/services/pricing.service';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDialog({ open, onOpenChange }: PaymentDialogProps) {
  const { state } = useApp();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [reference, setReference] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const plans = PricingService.getPlans();
  const currentPlan = plans.find((p) => p.id === selectedPlan);
  const amount = parseFloat(currentPlan?.price.replace(/[^0-9.]/g, '') || '0');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.user || !state.shop.id) return;
    
    setIsSubmitting(true);
    try {
      let proof_url = null;
      
      // 1. Upload proof file if provided
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${state.user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('payment_proofs')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('payment_proofs')
          .getPublicUrl(fileName);
          
        proof_url = publicUrl;
      }

      // 2. Create Payment Request
      const { error: requestError } = await supabase
        .from('payment_requests')
        .insert({
          shop_id: state.shop.id,
          profile_id: state.user.id,
          plan_id: selectedPlan,
          amount,
          currency: 'LKR',
          reference,
          proof_url,
          status: 'pending'
        });

      if (requestError) throw requestError;

      setIsSuccess(true);
      toast.success('Payment request submitted successfully!');
    } catch (err: any) {
      console.error('Payment submission failed:', err);
      toast.error(err.message || 'Failed to submit payment request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedPlan('pro');
    setReference('');
    setFile(null);
    setIsSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && (val ? onOpenChange(true) : resetForm())}>
      <DialogContent className="sm:max-w-[500px]">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Request Submitted</h2>
            <p className="text-muted-foreground mb-8">
              Your payment request is being reviewed. We will activate your subscription shortly.
            </p>
            <Button onClick={resetForm} className="w-full">Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Upgrade Subscription</DialogTitle>
              <DialogDescription>
                Transfer the subscription amount to our bank account and upload the proof.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Bank Details */}
              <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <Building2 className="w-4 h-4 text-primary" /> Menuzo Bank Details
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Bank</div>
                  <div className="font-medium">Commercial Bank</div>
                  <div className="text-muted-foreground">Branch</div>
                  <div className="font-medium">City Office</div>
                  <div className="text-muted-foreground">Account Name</div>
                  <div className="font-medium">Menuzo Tech</div>
                  <div className="text-muted-foreground">Account Number</div>
                  <div className="font-medium font-mono">1234 5678 9000</div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Plan</label>
                  <select 
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.price}/{p.period}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reference Number (Optional)</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Transaction ID / Remarks"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Proof</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/30 transition-colors relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">
                      {file ? file.name : "Click to upload receipt"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or PDF (max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/10"
                  onClick={() => {
                    const message = encodeURIComponent(`Hi Menuzo, I would like to upgrade my shop (${state.shop.name}) to the ${currentPlan?.name} plan. My Shop ID is: ${state.shop.id}`);
                    window.open(`https://wa.me/94770000000?text=${message}`, '_blank');
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Us
                </Button>
                
                <Button type="submit" className="flex-1" disabled={isSubmitting || !file}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4 mr-2" />
                      Submit Proof
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
