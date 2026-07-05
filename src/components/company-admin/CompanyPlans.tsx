import { mockPlans } from '@/data/companyAdminData';
import {
  Check, Star, Users, CreditCard, Pencil, Trash2, Plus,
  Tag, Megaphone, Percent, Calendar, Gift,
} from 'lucide-react';

export function CompanyPlans() {
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

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {mockPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-card/80 backdrop-blur-sm border rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
              plan.isPopular ? 'border-primary/50 shadow-lg shadow-primary/10' : 'border-border/50 hover:border-primary/30'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-current" />
                Most Popular
              </div>
            )}

            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white shadow-lg mb-4`}>
              <CreditCard className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mt-1 mb-4">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-sm text-muted-foreground">/{plan.interval}</span>
            </div>

            <div className="flex items-center gap-2 mb-4 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span><strong>{plan.activeSubscribers}</strong> active subscribers</span>
            </div>

            <div className="space-y-2 mb-5">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
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
