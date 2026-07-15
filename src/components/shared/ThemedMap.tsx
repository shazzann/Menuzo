import { useState, useEffect } from 'react';

interface ThemedMapProps {
  location: string;
  className?: string;
  children?: React.ReactNode;
}

export function ThemedMap({ location, className = '', children }: ThemedMapProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!location) return null;

  const filterStyle: React.CSSProperties = isDark
    ? { filter: 'invert(92%) hue-rotate(210deg) brightness(0.85) contrast(0.9) saturate(0.4)' }
    : { filter: 'sepia(15%) hue-rotate(345deg) saturate(1.2) contrast(0.95)' };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border ${className}`}>
      <iframe
        width="100%"
        height="100%"
        style={{ 
          border: 0, 
          position: 'absolute', 
          inset: '-20%', 
          width: '140%', 
          height: '140%', 
          ...filterStyle 
        }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=15&ie=UTF8&iwloc=near&output=embed`}
      />
      {children}
      {/* Custom orange pin overlay — sits on top of the default red pin at the map center */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -100%)',
          zIndex: 10,
          pointerEvents: 'none',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 520" width="28" height="38">
          <ellipse cx="192" cy="480" rx="96" ry="32" fill="#00000002" opacity="0.15" />
          <path fill="#F97316" d="M192 0C86 0 0 86 0 192c0 142 161 306 179 323 3 3 8 5 13 5s10-2 13-5c18-17 179-181 179-323C384 86 298 0 192 0zm0 270c-43 0-78-35-78-78s35-78 78-78 78 35 78 78-35 78-78 78z" />
        </svg>
      </div>
    </div>
  );
}
