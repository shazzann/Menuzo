# Menuzo Business Rules

## Pro Expiration Policy (Custom URLs)

When a Pro/Enterprise subscription expires and a shop is downgraded to the Free plan, the following Custom URL policy applies:

**1. Routing Redirect**
If a visitor accesses the custom URL (`/[username]`), the system will automatically redirect them to the standard Free URL (`/shop/[username]`). This ensures that QR codes and existing links printed by the restaurant do not break immediately, providing a graceful degradation of service.

**2. Username Reservation**
The `username` string remains permanently attached to the shop in the database (constrained by `UNIQUE`). It does not become available for other restaurants to claim. This prevents malicious actors from hijacking an expired restaurant's custom URL. 

**3. Entitlement Reinstatement**
If the shop owner renews their Pro subscription, the `/[username]` route will automatically become the primary route again without requiring admin intervention to re-assign the custom URL.

---

## Theme System Architecture

**Evaluation Outcome: Keep JSON-in-Shop Architecture**

After evaluating the MVP requirements, the current architecture of storing themes as a `jsonb` object (`{ primary, secondary, accent, qrStyle }`) directly within the `shops` table is sufficient.

**Rationale:**
1. Menuzo relies on dynamic brand color extraction and application rather than pre-built template sheets.
2. Generating a separate `themes` table adds unnecessary join complexity and relational overhead for what is essentially a string-dictionary of user preferences.
3. The global theme system is better served by the current approach where the Shop Owner specifies their 3 colors, and `getShopThemeStyles()` converts them into CSS variables injected directly into the DOM tree.
