import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store';
import { motion } from 'framer-motion';

export function OnboardingChecklist() {
  const { state } = useApp();
  
  // Calculate completion
  const hasRestaurant = !!state.shop?.name;
  const hasTheme = !!state.shop?.theme;
  const hasFood = state.foodItems && state.foodItems.length > 0;
  
  // For the sake of MVP dashboard empty state:
  const steps = [
    { label: 'Restaurant created', completed: hasRestaurant },
    { label: 'Theme selected', completed: hasTheme },
    { label: 'Add first menu item', completed: hasFood },
    { label: 'Generate QR', completed: false } // In MVP they just view it on Dashboard
  ];
  
  const completedCount = steps.filter(s => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);
  
  if (completedCount === steps.length) return null; // Hide if fully done

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border shadow-md rounded-3xl p-8 mb-8 relative overflow-hidden"
    >
      <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />
      
      <h2 className="text-2xl font-bold mb-2">Welcome to Menuzo 👋</h2>
      <p className="text-muted-foreground mb-6">Complete your setup to launch your digital menu.</p>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary" 
          />
        </div>
        <span className="font-bold text-sm text-primary">{progress}%</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {steps.map((step, idx) => (
          <div key={idx} className={`flex items-center gap-3 p-4 rounded-xl border ${step.completed ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'}`}>
            {step.completed ? (
              <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
            ) : (
              <Circle className="w-6 h-6 text-muted-foreground shrink-0" />
            )}
            <span className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
            {!step.completed && idx === completedCount && (
              <Button size="sm" variant="ghost" className="ml-auto p-0 h-auto hover:bg-transparent text-primary hover:text-primary/80">
                Start <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
