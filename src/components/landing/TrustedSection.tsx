export function TrustedSection() {
  return (
    <section className="py-12 border-b border-border/50 bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm font-medium text-muted-foreground mb-8">
          Trusted by innovative restaurants and cafes
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Using placeholder logos */}
          {['The Spice Garden', 'Bistro 42', 'Café Noir', 'Urban Plates', 'Green Bowl'].map((name, i) => (
            <div key={i} className="flex items-center gap-2 font-bold text-xl tracking-tighter">
              <div className="w-8 h-8 rounded-full bg-foreground/20" />
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
