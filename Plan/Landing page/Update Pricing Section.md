Use this prompt with your AI coding agent:

---

# Update Pricing Section (Data Only – No UI Changes)

**Task:**

Update the **Pricing** section of the Menuzo landing page.

## Important Constraints

* **DO NOT** modify the UI, layout, spacing, typography, colors, animations, icons, responsiveness, or component structure.
* **DO NOT** redesign anything.
* **DO NOT** change the pricing cards' styling.
* Only update the **content/data** displayed in the pricing section.

---

## Pricing Plans

Replace the existing **3 plans (Free, Starter, Business)** with **2 plans only**:

1. **Free**
2. **Pro**

Remove the **Starter** and **Business** plans completely.

---

## Free Plan

**Plan Name**

* Free

**Price**

* Free Forever

**Description**

* Perfect for small cafés, home businesses, and restaurants getting started with digital menus.

**Limits**

* Up to **10 Menu Items**
* Up to **2 Categories**

**Included Features**

* QR Code Menu
* Mobile-Friendly Digital Menu
* Food Images
* Restaurant Profile
* Basic Theme Customization
* Analytics Dashboard
* QR Scan Analytics
* Page View Analytics
* Shareable Menu Link

**Not Included**

* Custom Theme Designer
* Custom QR Code Branding
* Custom Menu URL
* Priority Support

**CTA Button**

* Get Started Free

---

## Pro Plan

**Plan Name**

* Pro

**Price**

* Use the existing Pro pricing already configured in the project. If no price exists yet, display "Coming Soon" temporarily.

**Description**

* Designed for growing restaurants and businesses that need advanced customization and higher limits.

**Limits**

* Up to **100 Menu Items**
* Up to **20 Categories**

**Included Features**

* Everything in Free
* Custom Theme Designer
* Custom QR Code Branding (Logo & Colors)
* Custom Menu URL
* Advanced Analytics Dashboard
* Priority Support

**CTA Button**

* Upgrade to Pro

---

## Comparison Logic

The **primary difference** between Free and Pro should be:

| Feature               | Free | Pro |
| --------------------- | ---- | --- |
| Menu Items            | 10   | 100 |
| Categories            | 2    | 20  |
| Analytics             | ✅    | ✅   |
| QR Menu               | ✅    | ✅   |
| Custom Theme Designer | ✅    | ✅   |
| Custom QR Branding    | ✅    | ✅   |
| Custom Menu URL       | ❌    | ✅   |
| Priority Support      | ❌    | ✅   |


Analytics should be available in **both** plans.

---

## Final Requirements

* Keep the existing component structure.
* Keep the existing card design.
* Keep the existing responsive behavior.
* Keep all animations.
* Update only the displayed pricing data.
* Ensure there are **exactly two pricing cards**: **Free** and **Pro**.
* Verify there are no remaining references to **Starter** or **Business** anywhere in the pricing section.
