The current Google Maps embed clashes with the Menuzo design because it's a **third-party UI** with its own colors, controls, typography, and branding. Since you're **not using a Maps API**, don't try to make the map itself match your theme—you can't. Instead, make the **container** feel like Menuzo and reduce the visual dominance of the map.

---

# Redesign Goal

The map should feel like a **secondary information card**, not the focal point.

Current hierarchy:

```
❌ Location Card
└── Large Google Map
    └── Google UI
```

Better hierarchy:

```
✓ Location
├── Address
├── Distance (optional)
├── Open in Google Maps button
└── Small preview map
```

---

# 1. Reduce the Map Height

Current height is too large.

Use around:

```
160px – 180px
```

instead of

```
220px+
```

This instantly looks cleaner.

---

# 2. Wrap the Map Inside a Premium Card

Instead of directly showing the iframe.

```
┌───────────────────────────────┐
│ 📍 Location                   │
│ 45 Main Street...             │
│                               │
│ ┌───────────────────────────┐ │
│ │                           │ │
│ │        Map Preview        │ │
│ │                           │ │
│ └───────────────────────────┘ │
│                               │
│ Open in Google Maps →         │
└───────────────────────────────┘
```

---

# 3. Rounded Corners

Current radius doesn't match the rest.

Use

```
border-radius: 18px;
overflow: hidden;
```

---

# 4. Add Inner Padding

Don't let the map touch the card edge.

```
padding:16px;
```

---

# 5. Add a Thin Border

Instead of the bright outline.

```
border:

1px solid rgba(255,255,255,0.06)
```

---

# 6. Remove the Purple Glow

Currently there is a purple outline around the map.

Use

```
No outline

No box-shadow
```

Only use a subtle hover shadow.

---

# 7. Use a Dark Overlay

Since Google Maps is brighter than your UI.

Place an overlay above the map.

```
background:

linear-gradient(
to bottom,
rgba(15,15,15,.18),
rgba(15,15,15,.05)
);
```

Very subtle.

Just enough to blend it into the dark UI.

---

# 8. Floating Action Button

Instead of the ugly default Google "Maps" button.

Hide it if possible.

Place your own button.

Example:

```
┌───────────────────────────┐
│                           │
│          Map              │
│                           │
│                ↗ Open Map │
└───────────────────────────┘
```

Orange button.

```
Background

#F59E0B

Text

White

Radius

12px
```

---

# 9. Add Location Pin Badge

Top-left

```
📍 Batticaloa
```

Inside

```
background:

rgba(17,17,17,.75)

backdrop blur

12px radius
```

Very modern.

---

# 10. Use a Fade Mask

At the bottom.

```
linear-gradient(
transparent,
rgba(17,17,17,.15)
);
```

Makes the map merge into the card.

---

# 11. Improve the Location Card Above

Current:

```
📍
Location

45 Main Street...
```

Better:

```
📍 Location

45 Main Street
Batticaloa 30000
Sri Lanka

Open in Google Maps →
```

Separate lines improve readability.

---

# 12. Make the Map Secondary

The address is more important than the map.

Example proportions:

```
Address

25%

Map

60%

Button

15%
```

---

# 13. Match Menuzo Colors

```
Background

#18181B

Card

#232327

Border

rgba(255,255,255,.06)

Primary

#F59E0B

Text

#FFFFFF

Secondary Text

#A1A1AA
```

---

# 14. Remove Visual Noise

Hide everything possible.

No unnecessary shadows.

No thick borders.

No bright outlines.

No oversized map.

Let the orange accent be the only strong color.

---

# Final Layout

```
┌────────────────────────────────────────┐
│ 📍 Location                            │
│                                        │
│ 45 Main Street                         │
│ Batticaloa 30000                       │
│ Sri Lanka                              │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 📍 Batticaloa                  ↗   │ │
│ │                                    │ │
│ │                                    │ │
│ │         Map Preview                │ │
│ │                                    │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [ Open in Google Maps ]                │
└────────────────────────────────────────┘
```

### One more suggestion

Since Menuzo is a **digital menu platform**, users rarely need to interact with the map itself. Consider **not embedding a live map at all**. Instead, use a **static map preview image** (generated from OpenStreetMap or a screenshot) with your pin and a single **"Open in Google Maps"** button. It loads faster, matches your design better, avoids Google's embedded UI, and keeps the page looking much more premium.
