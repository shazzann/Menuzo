# Menuzo Plan Feature Matrix & Entitlements

**Version:** 2.0.0  
**Effective Date:** 2026-11-18  
**Applicability:** Public Pricing, Application Enforcement, Database Triggers, and Customer Dashboard

---

## 1. Plan Overview

| Tier | Display Name | Internal Slug | Monthly Price (LKR) | Annual Price (LKR) | Annual Discount | Max Items | Max Categories |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Free** | Starter | `free` | LKR 0 | LKR 0 | N/A | 10 | 2 |
| **Plus** | Recommended *(Prev. Pro)* | `plus` (alias: `pro`) | LKR 1,500 | LKR 15,000 | LKR 3,000 (16.7%) | 100 | 20 |
| **Enterprise** | Full Access | `enterprise` | LKR 6,000 | LKR 65,000 | LKR 7,000 (9.7%) | 500 | 50 |

---

## 2. Comprehensive Feature Matrix

| Feature Domain | Feature Name | Free | Plus | Enterprise | Enforcement Location | Notes |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **Catalog Limits** | Food Items | 10 | 100 | 500 | `food_items` insert trigger + `canCreateItem()` | Server and client validated |
| | Categories | 2 | 20 | 50 | Category creation logic + `canCreateCategory()` | Server and client validated |
| **Menu Experience** | Responsive Digital Menu | Yes | Yes | Yes | Public views | Accessible across devices |
| | Portion / Size Variants | Yes | Yes | Yes | Menu creation | Regular, Large, etc. |
| | Special Offers & Badges | Yes | Yes | Yes | Menu creation | Discount calculation |
| **QR Code & Branding** | QR Code Generation | Standard | Advanced | Advanced | QR Generator / SVG export | Dynamic generation |
| | Custom Themes | 5 Presets | Full Customization | Full Customization | `enforce_pro_shop_themes` trigger | Brand palette editor |
| | Custom QR Branding | Basic | Advanced (Logo + Colors) | Advanced (Logo + Colors) | QR Export Modal | High-res 2048px exports |
| | Custom Vanity URL | No | Yes | Yes | `resolve_menu_shop` RPC | Assigned by admin, permanent |
| **Analytics** | View & Scan Tracking | Basic (Totals) | Advanced (30d Charts) | Advanced (Full Analytics) | `shopAnalytics.ts` | Filterable by 7d, 30d, today |
| **Customization** | Multiple Customization | No | Standard | Advanced | Dashboard Settings | Fine-grained layout presets |
| | Advanced Layout Styling | No | No | Yes | Customizer | Custom CSS/typography controls |
| **Support & Access** | Priority Support | No | No | Yes | WhatsApp / Support Desk | Fast-track support routing |
| | All Available Features | No | No | Yes | `hasFeatureAccess()` | Automatic entitlement to new releases |

---

## 3. Plan Enforcement Rules

### 3.1 Item & Category Boundary Scenarios

| Scenario | Active Plan | Action | Expected Result | System Reaction |
| :--- | :--- | :--- | :--- | :--- |
| **Free 11th item** | Free | Add 11th item | **Blocked** | Toast error + prompt to upgrade to Plus |
| **Plus 101st item** | Plus | Add 101st item | **Blocked** | Toast error + prompt to upgrade to Enterprise |
| **Enterprise 501st item** | Enterprise | Add 501st item | **Blocked** | Toast error: maximum enterprise catalog reached |
| **Free 3rd category** | Free | Add 3rd category | **Blocked** | Toast error + prompt to upgrade to Plus |
| **Plus 21st category** | Plus | Add 21st category | **Blocked** | Toast error + prompt to upgrade to Enterprise |
| **Enterprise 51st category** | Enterprise | Add 51st category | **Blocked** | Toast error: maximum categories reached |
| **Enterprise using Plus feature** | Enterprise | Custom URL / QR | **Allowed** | Enterprise inherits all Plus entitlements |
| **Expired Paid Plan (Grace)** | Expired ($\le 3$ days) | Menu views | **Allowed** | Menu stays completely visible during 3-day grace |
| **Expired Paid Plan (Post-Grace)**| Expired ($> 3$ days) | Items $> 10$ | **Hidden** | Excess items beyond Free limit are hidden from guests |
| **Downgrade to Plus** | Plus | Existing 150 items | **Read-Only Over Limit**| Existing items preserved; new additions blocked until $\le 100$ |

---

## 4. UI Representation Standards

- **Badge Labels:**
  - Free: Neutral Gray (`bg-muted text-muted-foreground`)
  - Plus: Primary Orange (`bg-primary/10 text-primary border-primary/20`)
  - Enterprise: Premium Purple (`bg-purple-500/10 text-purple-400 border-purple-500/30`)
- **Usage Indicators:**
  - Render dynamic progress bars on dashboard showing `current / max` items and categories.
  - Near limit ($\ge 80\%$): Amber warning indicator.
  - At limit ($100\%$): Destructive red limit badge with inline upgrade action button.
