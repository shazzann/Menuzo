import { useState } from 'react';
import { ArrowLeft, Loader2, Mail, Send, Store, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/store';
import { trackEvent } from '@/lib/analytics';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function ContactPage() {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    restaurantName: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('contact_submitted', { source: 'contact_page' });
    setLoading(true);
    
    // Simulate Supabase insert
    setTimeout(() => {
      setLoading(false);
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: '', email: '', restaurantName: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="h-16 bg-background border-b border-border px-6 flex items-center justify-between sticky top-0 z-50">
        <Button variant="ghost" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
        <div className="font-bold text-xl tracking-tight text-primary">Menuzo</div>
        <div className="w-24" /> {/* Spacer */}
      </header>

      <div className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border shadow-xl rounded-3xl p-8"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Get in touch</h1>
            <p className="text-muted-foreground">Have questions about Menuzo? We're here to help.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  required
                  placeholder="Your Name" 
                  className="pl-12 h-12"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  required
                  type="email"
                  placeholder="Email Address" 
                  className="pl-12 h-12"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                required
                placeholder="Restaurant Name" 
                className="pl-12 h-12"
                value={formData.restaurantName}
                onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
              />
            </div>

            <Textarea 
              required
              placeholder="How can we help?" 
              className="min-h-[150px] p-4 text-base resize-y"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
            
            <Button type="submit" className="w-full h-12 text-lg font-bold mt-4" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2">Send Message <Send className="w-5 h-5" /></span>}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
