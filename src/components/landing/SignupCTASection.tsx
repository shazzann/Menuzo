import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Utensils, Mail } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { useApp } from '@/store';

export function SignupCTASection() {
  const { dispatch } = useApp();
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('signup_started', { restaurantName, email, source: 'inline_signup_cta' });
    dispatch({ type: 'SET_VIEW', payload: 'login' }); // In a real app, pass this data to auth or waitlist
  };

  return (
    <section className="py-24 px-4 bg-background relative z-20 -mt-10">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border shadow-2xl shadow-primary/5 rounded-[2rem] p-8 md:p-12 relative overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none -z-10">
            <div className="w-64 h-64 bg-primary rounded-full blur-[80px]" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to digitize your restaurant?</h2>
            <p className="text-muted-foreground text-lg">
              Join for free and create your menu in less time than it takes to brew a coffee.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Restaurant Name" 
                className="h-14 pl-12 rounded-xl text-base bg-background"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
              />
            </div>
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                type="email" 
                placeholder="Email Address" 
                className="h-14 pl-12 rounded-xl text-base bg-background"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 rounded-xl font-bold shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all shrink-0">
              Create Menu <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
