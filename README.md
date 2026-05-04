# ⚡ EV Shop GH — Complete Full Stack Website

Ghana's dedicated Electric Vehicle parts store and EV sourcing service.
**Live URL:** https://evshopgh.com

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up your environment
cp .env.example .env
# Edit .env with your Paystack secret key and email password

# 3. Start the server
npm start
# → http://localhost:3000
```

**Admin login:** `admin@evshopgh.com` / `evadmin2024`

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express |
| Database | SQLite via sql.js (zero setup) |
| Frontend | HTML5 + CSS3 + Vanilla JS (SPA) |
| Auth | bcryptjs + express-session |
| Payments | Paystack (GHS + cards) |
| Email | Nodemailer (Outlook SMTP) |
| AI Chat | Claude API (claude-sonnet-4) |
| Currency | IP geolocation + open exchange rates |
| Translation | Google Translate widget |

---

## ✅ Features Checklist

### Store
- [x] Apple-inspired minimal design with electric blue accents
- [x] Animated hero with grid background and staggered reveals
- [x] Scrolling marquee of product categories
- [x] 16 pre-loaded EV parts across 6 categories
- [x] Product cards with badges, savings %, compatibility info
- [x] Category filtering + keyword search + sort
- [x] Product detail page with quantity selector
- [x] Shopping cart (session-based, works as guest)

### Payments & Orders
- [x] Paystack integration (GHS, cards, mobile money)
- [x] Guest checkout (no account needed)
- [x] Order confirmation emails to customer
- [x] Admin notification emails on new orders
- [x] Order tracking for logged-in users
- [x] Payment success/failure handling

### EV Sourcing
- [x] "Get a Quote" page — make, model, year, budget, port, notes
- [x] Quote notification email to admin (evsolutionsgh@outlook.com)
- [x] Quote confirmation email to customer
- [x] Admin panel quote management with status updates

### User Accounts
- [x] Register / Login / Logout
- [x] Secure password hashing (bcryptjs)
- [x] Order history for logged-in users
- [x] Guest checkout without account

### Content
- [x] Blog / News section with 3 seed articles
- [x] Blog post detail pages
- [x] About page with contact info

### Extras
- [x] IP-based currency detection (GHS default, auto-switches by country)
- [x] Google Translate widget (all languages)
- [x] AI Chatbot powered by Claude (EV-focused system prompt)
- [x] WhatsApp chat button (+233 59 477 5210)
- [x] Social media footer (Instagram, X, YouTube, WhatsApp)
- [x] Security headers (XSS, CSRF, clickjacking protection)
- [x] Responsive design (mobile + desktop)
- [x] Smooth scroll animations and micro-interactions

### Admin Panel
- [x] Dashboard stats (orders, revenue, products, users, quotes)
- [x] Product CRUD (add, edit, delete, feature)
- [x] Order management with status updates
- [x] Quote requests management

---

## 📂 Project Structure

```
ev-shop-gh/
├── server.js           # Express server + security headers
├── database.js         # SQLite schema + 16 products + blog posts
├── mailer.js           # Nodemailer — order & quote emails
├── .env.example        # Environment variables template
├── routes/
│   ├── auth.js         # Register, login, logout, /me
│   ├── products.js     # Browse, filter, search, detail
│   ├── cart.js         # Session cart management
│   ├── orders.js       # Paystack checkout + verification
│   ├── quotes.js       # Vehicle sourcing requests
│   ├── blog.js         # News articles
│   ├── currency.js     # IP geolocation + exchange rates
│   └── admin.js        # Full admin CRUD
└── public/
    └── index.html      # Complete SPA (4000+ lines)
```

---

## ⚙️ Configuration

### Paystack
1. Go to https://dashboard.paystack.com/#/settings/developer
2. Copy your **Secret Key** (sk_live_... for production)
3. Add to `.env`: `PAYSTACK_SECRET_KEY=sk_live_...`
4. Update the key in `routes/orders.js` (search `sk_test_placeholder`)

### Email (Outlook)
1. Set `EMAIL_USER=evsolutionsgh@outlook.com` in `.env`
2. Set `EMAIL_PASS=your_outlook_password` in `.env`
3. If using 2FA, create an App Password in Microsoft account settings

### Claude AI Chatbot
The chatbot calls the Anthropic API directly from the frontend.
This uses the shared API key — for production, proxy this through your backend.

### Domain Setup
Point `evshopgh.com` to your server and set `SITE_URL=https://evshopgh.com` in `.env`.
Use a reverse proxy (Nginx/Caddy) to handle HTTPS.

---

## 🌍 Deployment (Quick Guide)

**Recommended: Railway, Render, or VPS (DigitalOcean)**

```bash
# On your server:
git clone your-repo
cd ev-shop-gh
npm install --production
cp .env.example .env  # fill in your values
npm start
```

For persistent SQLite on cloud platforms, mount a volume at `/app/evshop.db`.

---

## 🤝 Social & Contact

- Instagram: [@td_kyeremanteng](https://instagram.com/td_kyeremanteng)
- X / Twitter: [@td_kyeremanteng](https://x.com/td_kyeremanteng)
- YouTube: [@sakentstudio](https://youtube.com/@sakentstudio)
- WhatsApp: +233 59 477 5210
- Email: evsolutionsgh@outlook.com
