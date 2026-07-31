import { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Star, CreditCard, Pencil, Trash2, Plus,
  Tag, Megaphone, Percent, Calendar, Gift, Save, X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PricingService, type PricingPlan } from '@/services/pricing.service';

export function CompanyPlans() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  useEffect(() => {
    const loadPlans = () => setPlans(PricingService.getPlans());
    loadPlans();

    const handleUpdate = () => loadPlans();
    window.addEventListener('pricing_updated', handleUpdate);
    return () => window.removeEventListener('pricing_updated', handleUpdate);
  }, []);

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlanId(plan.id);
    setEditPrice(plan.price);
  };

  const handleSave = (id: string) => {
    PricingService.updatePlanPrice(id, editPrice);
    setEditingPlanId(null);
  };

  const handleCancel = () => {
    setEditingPlanId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage pricing plans and features</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Create Plan
        </button>
      </div>

      {/* Plan Cards - Admin Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col h-full bg-card/80 backdrop-blur-sm border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              plan.popular ? 'border-primary/50 shadow-lg shadow-primary/10' : 'border-border/50 hover:border-primary/30'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-current" />
                {plan.badge}
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.popular ? 'from-primary to-orange-600' : 'from-slate-500 to-slate-700'} flex items-center justify-center text-white shadow-lg`}>
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              {editingPlanId === plan.id ? (
                <div className="flex gap-1">
                  <button onClick={() => handleSave(plan.id)} className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handleCancel} className="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button onClick={() => handleEdit(plan)} className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-baseline gap-1 mb-3">
              {editingPlanId === plan.id ? (
                <Input 
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="text-2xl font-bold tracking-tight h-10 w-28 px-2"
                  autoFocus
                />
              ) : (
                <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
              )}
              {plan.period && <span className="text-sm text-muted-foreground font-medium">{plan.period}</span>}
            </div>

            <p className="text-sm text-muted-foreground mb-4 flex-grow">
              {plan.description}
            </p>

            <div className="space-y-2 mb-5">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
              {plan.notIncluded?.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground/50">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit Details
                </button>
                <button className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coupons & Promotions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Coupons */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold">Active Coupons</h3>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="space-y-3">
            {[
              { code: 'WELCOME20', discount: '20%', type: 'Percentage', uses: 145, maxUses: 500, expires: '2026-08-01' },
              { code: 'PROMONTH', discount: '$5', type: 'Fixed', uses: 89, maxUses: 200, expires: '2026-07-31' },
              { code: 'ANNUAL50', discount: '50%', type: 'Percentage', uses: 34, maxUses: 100, expires: '2026-12-31' },
            ].map((coupon) => (
              <div key={coupon.code} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Percent className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-mono font-bold">{coupon.code}</p>
                    <p className="text-xs text-muted-foreground">{coupon.discount} off • {coupon.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{coupon.uses}/{coupon.maxUses}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {coupon.expires}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promotions */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-violet-500" />
              <h3 className="text-lg font-semibold">Active Promotions</h3>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Summer Sale', status: 'Active', reach: '2,450 shops', startDate: '2026-06-01', endDate: '2026-08-31' },
              { name: 'Referral Program', status: 'Active', reach: '1,890 shops', startDate: '2026-01-01', endDate: '2026-12-31' },
              { name: 'New Year Offer', status: 'Scheduled', reach: 'All shops', startDate: '2026-12-25', endDate: '2027-01-05' },
            ].map((promo) => (
              <div key={promo.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{promo.name}</p>
                    <p className="text-xs text-muted-foreground">{promo.reach}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    promo.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {promo.status}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1">{promo.startDate} → {promo.endDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
