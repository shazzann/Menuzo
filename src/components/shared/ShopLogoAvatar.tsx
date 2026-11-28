interface ShopLogoAvatarProps {
  logo?: string | null;
  name?: string;
}

/** Displays the shop's logo or an initial fallback in owner dashboard headers. */
export function ShopLogoAvatar({ logo, name }: ShopLogoAvatarProps) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={name || 'Shop logo'}
        className="w-10 h-10 rounded-xl object-cover border border-border/50 shrink-0"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary border border-primary/20 flex items-center justify-center font-bold text-base shrink-0">
      {name ? name.charAt(0).toUpperCase() : 'S'}
    </div>
  );
}
