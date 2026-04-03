# Going Live Checklist

## LLM Optimization

- [x] Create `llms.txt` in `apps/web/public/` with product summary.
- [ ] Deploy the website to production.
- [ ] Verify `https://your-domain.com/llms.txt` is accessible.
- [ ] Submit to **[llmstxt.site](http://llmstxt.site)**
- [ ] Submit to **[directory.llmstxt.cloud](http://directory.llmstxt.cloud)**

## Search Engine Optimization (SEO)

- [ ] (Optional) Submit `sitemap.xml` to Google Search Console.
- [ ] Verify meta tags (Title, Description) are present on all pages.

## Configuration

- [ ] Uncomment `cookieCache` setting in `packages/auth/src/index.ts` when deploying to Cloudflare using `*.workers.dev` domains.
- [ ] Uncomment `crossSubDomainCookies` setting in `packages/auth/src/index.ts` replacing `<your-workers-subdomain>` with your actual workers subdomain when deploying.
- [ ] Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in web runtime env.
- [ ] Set `TURNSTILE_SECRET` and `TURNSTILE_ENABLED=true` in server runtime env.
- [ ] Emergency fallback only: set `TURNSTILE_ENABLED=false` to temporarily bypass verification.

## Verification

- [ ] Test all affiliate/perk links in production.
- [ ] Verify mobile responsiveness.
