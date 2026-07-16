The next phase is the **visual/UI specification**. This defines exactly how the landing page should look and feel so a designer or developer can build it consistently.

---

# Menuzo Landing Page UI Blueprint (v1.0)

## Overall Design Language

**Keywords**

* Premium
* Minimal
* Elegant
* Modern SaaS
* Restaurant-focused
* Spacious
* Interactive

Think of the quality level of:

* Stripe
* Linear
* Framer
* Vercel
* Notion
* Raycast

Not because Menuzo is for developers, but because these products demonstrate excellent SaaS UX.

---

# Page Flow

```
Navbar
↓

Hero

↓

Trusted by Restaurants

↓

Restaurant Problems

↓

Why Menuzo

↓

Interactive Product Preview

↓

Features

↓

How It Works

↓

Theme Showcase

↓

QR Customization

↓

Dashboard Preview

↓

Customer Mobile Experience

↓

Analytics

↓

Pricing

↓

Testimonials

↓

FAQ

↓

Final CTA

↓

Footer
```

---

# Section Spacing

```
Desktop

120px

Tablet

96px

Mobile

72px
```

Never stack sections too tightly.

---

# Card Style

```
Background

White

Border

1px Light Border

Radius

24px

Shadow

Very Soft

Padding

32px
```

Cards should rely more on spacing than heavy shadows.

---

# Buttons

### Primary

* Filled brand color
* White text
* 14–16px radius
* Height: 52–56px
* Hover: slightly darker + subtle lift

### Secondary

* Transparent
* Border
* Brand-colored text
* Soft hover background

---

# Icons

Use one icon family throughout (e.g., Lucide).

```
Container

48 × 48

Rounded

Soft background tint

Icon

24px
```

---

# Hero Layout

```
+------------------------------------------------------+
| Navbar                                               |
+------------------------------------------------------+

+----------------------+------------------------------+
|                      |                              |
| Heading              |   Phone Mockup              |
|                      |                              |
| Description          |   Floating Cards            |
|                      |                              |
| CTA                  |                              |
|                      |                              |
+----------------------+------------------------------+
```

---

# Hero Background

Layer the background:

1. Light gradient
2. Subtle grid pattern
3. Large blurred blobs
4. Tiny noise texture
5. Slow-moving floating shapes

This adds depth without distracting.

---

# Hero Mockup

The phone should show:

* Restaurant cover image
* Restaurant logo
* Search
* Categories
* Featured dishes
* Promotions
* Contact section

Around the phone, float small cards:

* QR Code
* Analytics
* Theme
* New Offer
* Menu Updated
* Customer Rating

---

# Interactive Product Preview

Use tabs:

```
Dashboard
QR
Themes
Customer Menu
Analytics
```

Switching tabs updates:

* Screenshot
* Caption
* Feature list

Animate with fade/slide.

---

# Problem vs Solution

Two-column comparison.

| Traditional Restaurant | Menuzo              |
| ---------------------- | ------------------- |
| Printed menus          | QR menus            |
| Reprinting             | Instant updates     |
| Old prices             | Live changes        |
| No branding            | Brand customization |
| No insights            | Analytics           |

This quickly communicates value.

---

# Feature Grid

Three columns on desktop.

Each card contains:

* Icon
* Title
* Short description
* Learn more arrow

Hover effects:

* Slight lift
* Border highlight
* Icon animation

---

# Theme Showcase

Horizontal carousel.

Each card:

* Theme name
* Mini phone preview
* Accent colors

Selecting a theme updates a larger phone preview.

---

# QR Showcase

Display a large QR preview with controls beside it.

Controls:

* Foreground color
* Background color
* Corner style
* Pattern
* Logo toggle
* Frame style

Changes should reflect instantly.

---

# Dashboard Preview

Browser-style frame showing:

* Menu manager
* Analytics
* Theme editor
* QR manager
* Business profile

Highlight one feature at a time with annotations.

---

# Customer Experience

Phone mockup scrolling automatically.

Highlight:

* Categories
* Food cards
* Search
* Offers
* Gallery
* Contact
* Map
* Social links

---

# Analytics Section

Use realistic charts.

Include:

* QR scans
* Menu views
* Most viewed dishes
* Call clicks
* Direction clicks

Show a clean dashboard, not placeholder graphs.

---

# Pricing

Three cards:

* Free
* Starter
* Business

Middle plan emphasized.

Comparison table below if needed.

---

# Testimonials

Use authentic-looking restaurant cards:

* Restaurant logo
* Owner photo
* Review
* Rating

Slider on desktop, stacked on mobile.

---

# FAQ

Accordion with smooth open/close.

Keep answers concise.

---

# Final CTA

Large gradient section.

Content:

* Bold heading
* Short supporting text
* Primary CTA
* Secondary CTA

Background elements:

* QR illustration
* Floating phone
* Brand-colored glow

---

# Footer

Four columns:

### Product

* Features
* Themes
* Pricing
* Updates

### Resources

* Help Center
* Documentation
* Blog
* Roadmap

### Company

* About
* Contact
* Careers
* Legal

### Social

* Facebook
* Instagram
* LinkedIn

Bottom row:

* Copyright
* Language selector
* Theme switch (optional)

---

# Motion Guidelines

Keep animations subtle and purposeful.

* Sections fade in as they enter view.
* Cards lift 4–8px on hover.
* Buttons scale slightly on hover.
* Phone mockups float slowly.
* Counters animate once.
* Tab changes use fade + slide.
* QR preview updates instantly.
* Theme switching transitions smoothly.

---

# Responsive Strategy

**Desktop (≥1200px)**

* Two-column layouts
* Full animations
* Large mockups

**Tablet (768–1199px)**

* Some sections stack
* Reduced spacing
* Smaller previews

**Mobile (<768px)**

* Single-column layout
* Sticky CTA button
* Swipeable carousels
* Simplified animations
* Optimized image sizes

---

## Before Building

Create these assets first:
use domine/menuzo/menu as a demo page
1. Restaurant logo (demo brand) 
2. Restaurant banner image
3. Food item images
4. Dashboard screenshots
5. Customer menu screenshots
6. Theme preview screens (5–6 themes)
7. QR code variations
8. Analytics dashboard mockup
9. Browser mockup
10. Mobile phone mockups
11. Custom illustrations/icons
12. Testimonial avatars/logos

Having these ready before development will make the landing page feel polished rather than like a collection of placeholders.
