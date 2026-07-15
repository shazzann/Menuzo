import { MapPin } from 'lucide-react';
import { ThemedMap } from './ThemedMap';

interface LocationCardProps {
  location: string;
}

export function LocationCard({ location }: LocationCardProps) {
  if (!location) return null;

  // Split location by commas for multiline display
  const addressLines = location.split(',').map(line => line.trim()).filter(Boolean);

  return (
    <div className="bg-[#232327] rounded-[18px] border border-white/[0.06] p-4 flex flex-col gap-4">
      {/* Header and Address */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-white">Location</h3>
        </div>
        
        <div className="space-y-0.5">
          {addressLines.map((line, i) => (
            <p key={i} className="text-[#A1A1AA] text-sm">{line}</p>
          ))}
        </div>
      </div>

      {/* Map Preview Area */}
      <div 
        className="relative w-full h-[170px] rounded-[12px] overflow-hidden group cursor-pointer"
        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(location)}`, '_blank')}
      >
        {/* The actual map (non-interactive) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <ThemedMap location={location} className="w-full h-full border-0 !rounded-none">
            {/* Dark overlay to blend the map */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f]/30 to-[#0f0f0f]/5 pointer-events-none" />
            
            {/* Bottom Fade Mask */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#232327]/80 to-transparent pointer-events-none" />
          </ThemedMap>
        </div>
      </div>

      {/* Full width Open Button */}
      <a
        href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-full py-2.5 rounded-[12px] bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
      >
        Open in Google Maps
      </a>
    </div>
  );
}
