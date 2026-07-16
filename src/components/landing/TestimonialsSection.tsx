import { Quote, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "We updated our entire menu in minutes. No more scratching out prices or reprinting dirty menus. Our customers love the photos.",
      name: 'Priyanka D.',
      role: 'Owner',
      restaurant: 'The Spice Garden',
      location: 'Colombo',
      avatar: '/avatar-1.jpg', 
      rating: 5,
    },
    {
      quote: "Updates are instant. We change our lunch specials every single day without calling a web developer. It's saved us thousands.",
      name: 'Sam Rodriguez',
      role: 'Head Chef',
      restaurant: 'Bistro 42',
      location: 'Kandy',
      avatar: '/avatar-2.jpg',
      rating: 5,
    },
    {
      quote: "Setup took exactly 10 minutes. The QR poster is clean and sharp. Customers order faster because they can actually see the food.",
      name: 'Jordan Park',
      role: 'Founder',
      restaurant: 'Urban Roast',
      location: 'Galle',
      avatar: '/avatar-3.jpg',
      rating: 5,
    },
  ];

  return (
    <section className="py-32 px-4 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Loved by small teams.</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-10 rounded-[2.5rem] bg-card border border-border/50 shadow-sm relative group hover:shadow-2xl hover:border-primary/20 transition-all duration-300"
            >
              <Quote className="w-12 h-12 text-primary/20 mb-8 group-hover:text-primary/40 transition-colors duration-300" />
              <div className="flex gap-1 mb-6">
                 {[...Array(testimonial.rating)].map((_, j) => (
                   <Star key={j} className="w-5 h-5 text-orange-400 fill-orange-400" />
                 ))}
              </div>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-medium">"{testimonial.quote}"</p>
              <div className="flex items-center gap-5 mt-auto">
                <div className="w-14 h-14 rounded-full bg-muted overflow-hidden ring-4 ring-background shadow-md shrink-0">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + testimonial.name)} />
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight">{testimonial.name}</h4>
                  <p className="text-sm font-semibold text-primary">{testimonial.role} @ {testimonial.restaurant}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
