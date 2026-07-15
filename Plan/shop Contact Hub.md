The current section works, but it feels like a list of information rather than an interactive **Contact Hub**. Since Menuzo is a digital menu, every item should be actionable.

## Suggested Layout

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Contact

📱 Call Restaurant
+94 77 345 6789
(Call icon → Tap to Call)

📱 Reservations
+94 76 123 4567
(Call icon → Tap to Call)

📱 Delivery
+94 71 987 6543
(Call icon → Tap to Call)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✉️ Email

hello@spicegarden.lk
(Tap → Opens Email App)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Location

123 Main Street,
Colombo 03

[View on Google Maps]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕒 Opening Hours

Monday - Saturday
10:00 AM – 10:00 PM

Sunday
Closed

• Currently Open (Green)
or
• Closed • Opens Tomorrow 10:00 AM (Red)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Online Presence

Instagram
Facebook
TikTok
WhatsApp
Website

(all open respective pages)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ Quick Actions

📞 Call
💬 WhatsApp
📍 Directions
🌐 Website
```

---

# Better Card Design

Instead of large blocks, use compact cards.

```
━━━━━━━━━━━━━━━━━━

📞 Contact

╭────────────────────╮
│ 📱 Main Contact    │
│ +94 77 345 6789    │
╰────────────────────╯

╭────────────────────╮
│ 📱 Reservations    │
│ +94 76 111 1111    │
╰────────────────────╯

╭────────────────────╮
│ 🚚 Delivery        │
│ +94 75 222 2222    │
╰────────────────────╯

━━━━━━━━━━━━━━━━━━

✉️ Email

╭────────────────────╮
│ hello@shop.lk      │
╰────────────────────╯

━━━━━━━━━━━━━━━━━━

🌐 Follow Us

Instagram
Facebook
TikTok
WhatsApp
Website

━━━━━━━━━━━━━━━━━━
```



# Email Features

Instead of only displaying the email:

```
hello@shop.lk

✉️ Tap to Email
```

Redirect using:

```
mailto:hello@shop.lk
```

Optional:

* Copy Email
* Multiple emails (max 2)

---

# Social Links

Support:

* Instagram
* Facebook
* TikTok
* WhatsApp
* YouTube
* X (Twitter)
* LinkedIn
* Website
* Custom Link

Each opens the respective app or browser.

Only show platforms that the restaurant has configured.

---

# Opening Hours

Instead of one line:

```
Monday - Saturday
10:00 AM - 10:00 PM
```

Show:

```
Today

Open Now 🟢

10:00 AM – 10:00 PM

Weekly Schedule

Mon    10 - 10
Tue    10 - 10
Wed    10 - 10
Thu    10 - 10
Fri    10 - 11
Sat    10 - 11
Sun    Closed
```

Automatically calculate:

* Open Now
* Closed
* Opens at...
* Closes at...

---

# Location

If available:

```
📍 123 Main Street
Batticaloa

[Get Directions]
```

Click:

```
https://maps.google.com/?q=...
```

Since you're embedding Google Maps via iframe without the Maps API, this button can simply open Google Maps in a new tab.

---

# Additional Features

### Service Badges

Display below opening hours.

```
🍽️ Dine In
🛵 Delivery
🥡 Takeaway
🚗 Parking
📶 Free WiFi
♿ Wheelchair Access
❄️ Air Conditioned
```

---

### Payment Methods

```
Accepted Payments

💵 Cash
💳 Visa
💳 Mastercard
📱 Apple Pay
📱 Google Pay
```

---

### Languages (in future not now)

```
Languages

🇬🇧 English
🇱🇰 Sinhala
🇮🇳 Tamil
```

---

### Restaurant Information (in future not now)


```
Established
2019

Cuisine
Indian • Chinese • Sri Lankan

Average Price
Rs. 1,200

Delivery Radius
8 km
```

---

### QR Sharing (in future not now)


Quick share actions:

```
Share Restaurant

WhatsApp
Facebook
Copy Link
QR Code
```

---

## Dashboard Settings Structure

```
Contact Information
eg
Main Phone
Reservation Phone
Delivery Phone
{porpose(main/delivary/riservation/hotline/custom_label)} phone 
Note: All three phone numbers can be entered by the restaurant. They will appear as clickable buttons on the customer menu, but the restaurant can choose which numbers to display.

Email

Website

Address

Google Maps Link

Opening Hours

Social Links
    Instagram
    Facebook
    TikTok
    WhatsApp
    YouTube
    X
    LinkedIn
below can be provided as badges
Services
    ✓ Dine In
    ✓ Delivery
    ✓ Takeaway
    ✓ Parking
    ✓ WiFi
    ✓ AC

Payment Methods
    ✓ Cash
    ✓ Visa
    ✓ Mastercard
    ✓ Apple Pay
    ✓ Google Pay

Languages

Visibility
```

This redesign makes the section significantly more useful: every piece of information becomes interactive, the restaurant can configure rich metadata without clutter, and the UI remains consistent with Menuzo's minimalist design system.
---

# Contact Features

Allow up to **3 phone numbers**.

Each contact should have:

* Label

  * Main
  * Reservations
  * Delivery
  * Hotline
  * Manager
  * Custom label
* Phone Number
* Tap to Call (`tel:`)
* Copy Number
* Hide/Show toggle

---