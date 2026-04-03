# Uni-Perks Setup & Launch Checklist

A comprehensive checklist for setting up, populating, and launching your student deals platform.

---

## 1. Environment Setup

### Cloudflare Account

- [ ] Create Cloudflare account (if not existing)
- [ ] Enable Workers (free tier available)
- [ ] Enable D1 database
- [ ] Create R2 bucket for images (`uni-perks-images`)

### Environment Variables

#### apps/server/.env

```env
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001
TURNSTILE_ENABLED=false
# Production only:
# TURNSTILE_SECRET=your-cloudflare-turnstile-secret
```

#### apps/web/.env

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3001
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-cloudflare-turnstile-site-key
```

### Local Development

- [ ] Install dependencies: `bun install`
- [ ] Run development: `bun run dev`
- [ ] Verify API at <http://localhost:3000>
- [ ] Verify Web at <http://localhost:3001>
- [ ] use react doctor to fix react issues <[React Doctor](https://github.com/millionco/react-doctor)>

---

## 2. Database Setup

### Schema & Seeding

- [ ] Apply database schema: `bun run db:push`
- [ ] Seed categories via API: `POST /api/seed` or manual insert
- [ ] Verify tables exist in D1 console

### First Admin Account

- [ ] Navigate to `/login`
- [ ] Create first account (automatically becomes admin)
- [ ] Verify admin access to `/admin`

---

## 3. Content Population

### Categories to Add

- [ ] Tech & Software
- [ ] Fashion & Lifestyle  
- [ ] Food & Delivery
- [ ] Travel & Transport
- [ ] Entertainment & Streaming
- [ ] Health & Wellness
- [ ] Education & Learning
- [ ] Sports & Outdoors

### Brands to Add (with logos)

- [ ] Nike (upload logo to R2)
- [ ] Spotify
- [ ] Adobe
- [ ] Amazon
- [ ] Apple
- [ ] GitHub
- [ ] ASOS
- [ ] H&M
- [ ] Adidas
- [ ] DoorDash
- [ ] Add more brands...

### Deals to Add (per brand)

- [ ] Verify each deal's claim URL is active
- [ ] Set discount type, value, and label
- [ ] Add conditions/terms (JSON array)
- [ ] Set verification method (edu_email, sheerid, unidays, student_beans)
- [ ] Add regional availability

### Collections to Create

- [ ] Student Essentials
- [ ] Tech for Students
- [ ] Fashion Finds
- [ ] Food & Delivery
- [ ] Fitness & Wellness
- [ ] Seasonal/Holiday collections

---

## 4. Affiliate Partnerships

### Affiliate Networks to Join

- [ ] **Impact** (impact.com) - Nike, Adidas, fashion brands
- [ ] **Rakuten** (rakutenadvertising.com) - Large retailers
- [ ] **CJ Affiliate** (cj.com) - Diverse portfolio
- [ ] **ShareASale** (shareasale.com) - Mid-tier brands
- [ ] **Awin** (awin.com) - European + US brands
- [ ] **Amazon Associates** - Prime Student, Amazon products
- [ ] **PartnerStack** - SaaS/tech tools

### Student Verification Partners

- [ ] **SheerID** (sheerid.com) - Verification API
- [ ] **ID.me** - US-focused verification
- [ ] Consider **UNiDAYS** partner program

### Brand Outreach Checklist

For each brand you want to partner with:

- [ ] Find brand's affiliate program page (usually `/affiliates` or `/partners`)
- [ ] Apply to their program via affiliate network
- [ ] Wait for approval (usually 3-7 days)
- [ ] Get your unique affiliate tracking link
- [ ] Add to `affiliateUrl` field in deals table
- [ ] Test link works correctly

### Outreach Email Template

```
Subject: Partnership Inquiry - Uni-Perks Student Discount Platform

Hi [Brand] Affiliate Team,

I'm reaching out from Uni-Perks, a student-focused discount platform 
helping university students save on essential products and services.

We'd love to feature [Brand] on our platform and drive student traffic
to your store through our verified student deals.

Our platform currently features X+ brands and reaches Y+ students monthly.

Would you be open to a partnership? We can:
- Feature exclusive student-only codes
- Provide tracking and analytics
- Promote via our newsletter and social channels

Please let me know the best way to proceed.

Best regards,
[Your Name]
Uni-Perks Team
```

---

## 5. Image Assets

### Upload to R2

- [ ] Brand logos (PNG/SVG preferred, 200x200px)
- [ ] Deal cover images (1200x800px or 3:2 ratio)
- [ ] Category images (1200x600px)
- [ ] Favicon and social sharing images

### Naming Convention

```
brands/{brand-slug}/logo.png
brands/{brand-slug}/cover.jpg
deals/{deal-slug}/banner.jpg
categories/{category-slug}/cover.jpg
```

---

## 6. SEO & Discovery

### Technical SEO

- [ ] Verify sitemap at `/sitemap.xml`
- [ ] Verify robots.txt at `/robots.txt`
- [ ] Add meta titles/descriptions to all pages
- [ ] Add Open Graph images for social sharing
- [ ] Implement structured data (JSON-LD) for deals

### LLM Optimization

- [ ] Verify `llms.txt` is accessible at `/llms.txt`
- [ ] Submit to **llmstxt.site**
- [ ] Submit to **directory.llmstxt.cloud**

### Search Console

- [ ] Add site to Google Search Console
- [ ] Submit sitemap
- [ ] Verify ownership
- [ ] Monitor indexing status

---

## 7. Testing & QA

### Functionality Testing

- [ ] All deal links work and redirect correctly
- [ ] Search functionality returns relevant results
- [ ] Category filters work correctly
- [ ] Admin CRUD operations work for all entities
- [ ] Image uploads work in admin panel
- [ ] Analytics tracking records views/clicks

### Mobile Testing

- [ ] Test on mobile (iOS Safari)
- [ ] Test on mobile (Android Chrome)
- [ ] Test on tablet
- [ ] Verify responsive design

### Performance

- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Optimize images (WebP format)
- [ ] Verify fast page loads

---

## 8. Deployment

### Pre-Deployment

- [ ] Update environment variables for production
- [ ] Set `BETTER_AUTH_URL` to production URL
- [ ] Set `CORS_ORIGIN` to production URL
- [ ] Set `NEXT_PUBLIC_BASE_URL` to production URL
- [ ] Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (web/public key)
- [ ] Set `TURNSTILE_SECRET` (server/secret key)
- [ ] Set `TURNSTILE_ENABLED=true` in production
- [ ] Configure custom domain in Cloudflare

### Deploy

- [ ] Run `bun run deploy`
- [ ] Verify deployment successful
- [ ] Test production site

### Post-Deployment

- [ ] Create production admin account
- [ ] Seed production database
- [ ] Verify all links work in production
- [ ] Set up monitoring/alerts
- [ ] If Turnstile outage blocks auth, set `TURNSTILE_ENABLED=false` as emergency rollback

---

## 9. Post-Launch

### Marketing

- [ ] Announce on social media
- [ ] Submit to student deal directories
- [ ] Reach out to university student unions
- [ ] Create content for student blogs

### Monitoring

- [ ] Set up Cloudflare analytics
- [ ] Monitor deal click-through rates
- [ ] Track most popular deals
- [ ] Monitor for broken links

### Maintenance

- [ ] Regular deal verification (weekly)
- [ ] Remove expired deals
- [ ] Update discount values as they change
- [ ] Add new brands/deals regularly

---

## Quick Reference Commands

```bash
# Development
bun run dev           # Start all apps
bun run dev:web       # Start web only
bun run dev:server    # Start API only

# Database
bun run db:push       # Push schema changes
bun run db:studio     # Open Drizzle Studio

# Deployment
bun run deploy        # Deploy to Cloudflare
bun run destroy       # Remove deployment

# Type checking
bun run check-types   # Check all TypeScript
```

---

## Support & Resources

- **Cloudflare Docs**: <https://developers.cloudflare.com>
- **Better Auth Docs**: <https://www.better-auth.com>
- **Drizzle ORM**: <https://orm.drizzle.team>
- **Next.js Docs**: <https://nextjs.org/docs>
- **Alchemy (infra)**: <https://alchemy.run>

---

*Last updated: 2026-02-22*
