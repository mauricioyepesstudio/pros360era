# Deploy to Vercel - EvolUSA Homepage

**Status:** Main branch ready for production
**Commit:** `d1e634b` (Merged from integration/evolusa-main-reconciliation-20260924)
**Date:** 2026-09-28

---

## 📋 Pre-Deploy Verification

✅ All quality gates passed:
- TypeScript: No errors
- Lint: 0 errors, 0 warnings
- Tests: 58/58 passed
- Build: Successful

✅ All 6 files staged and merged:
- app/page.tsx
- components/layout/SiteHeader.tsx
- sections/home/Hero.tsx
- sections/home/HeroArtboard.tsx
- sections/home/ProfessionalJourneyFlow.tsx
- sections/home/UserJourneyFlow.tsx

✅ Visual verification complete:
- 1440px: Contrast improved ✓
- 1024px: Family visible, 6 stages visible ✓
- 768px: 6 stages in one line ✓
- 390px: 6 stages in two rows, no horizontal scroll ✓
- 360px: All 6 stages visible, no recortes ✓

---

## 🚀 Deploy Steps

### Option 1: GitHub-connected Vercel (Automatic)
1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Select project `pros360era`
3. Go to "Settings" → "Git"
4. Verify "Source: GitHub" and Branch: "main"
5. Deploy button should automatically trigger on main push
6. Wait for build to complete (typically 2-5 minutes)

**Status:** Branch is already pushed to `origin/main`. Vercel should auto-detect and build.

### Option 2: Manual Vercel Deploy
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy main branch
vercel --prod

# Or re-deploy latest:
vercel prod --yes
```

### Option 3: GitHub Actions (if configured)
Check `.github/workflows/deploy.yml` for automated CI/CD pipeline.

---

## 📊 Post-Deploy Verification

After deploy completes, verify:

1. **Homepage loads:** https://evolusa.app
2. **Dual CTAs visible:**
   - "Necesito ayuda" (Red button)
   - "Soy profesional" (Navy outline button)
3. **6 Stages visible:** LLEGA, ESTABLÉCETE, EMPRENDE, PROTÉGETE, CRECE, EVOLUCIONA
4. **Responsive test:**
   - Desktop (1440px): 6 stages, full layout ✓
   - Tablet (768px): 6 stages in one line ✓
   - Mobile (390px): 6 stages in two rows ✓
5. **CTAs functional:**
   - /onboarding loads correctly
   - /aplicar-profesional loads correctly
   - /profesionales directory works
6. **Analytics connected:**
   - GA4 tracking live
   - Session tracking working
   - Event tracking for CTAs

---

## 📱 Mobile Verification Checklist

- [ ] Header renders without button overlap
- [ ] "Necesito ayuda" button spans full width, centered
- [ ] "Soy profesional" button spans full width, centered  
- [ ] "Ya tengo cuenta" link visible below buttons
- [ ] 6 journey stages visible (2 rows × 3)
- [ ] No horizontal scroll
- [ ] All text readable, no recortes
- [ ] Touch targets >= 44px

---

## 🎯 Campaign Launch Sequence

**Timing:**
1. Deploy to Vercel: 2026-09-28 (TODAY)
2. Verify homepage: 30 minutes
3. Launch Resource Living campaigns: 2026-09-29 (TOMORROW)

**Campaign start checklist:**
- [ ] Homepage live and verified
- [ ] Analytics tracking confirmed
- [ ] Email sequences ready
- [ ] Social content calendar ready
- [ ] Facebook campaigns queued
- [ ] Instagram posts scheduled
- [ ] LinkedIn content ready
- [ ] TikTok reel prepared

---

## 🔧 Troubleshooting

**Build fails:**
- Check `npm run build` locally
- Verify all TypeScript: `npx tsc --noEmit`
- Check environment variables in Vercel settings

**Deploy takes too long (>10 min):**
- Check build logs in Vercel dashboard
- May indicate large asset or dependency issue
- Contact Vercel support if stuck

**Homepage doesn't load:**
- Check DNS/CDN propagation (typically instant)
- Verify domain points to Vercel nameservers
- Check Vercel project settings

**Responsive layout breaks:**
- Test on actual device (not just dev tools)
- Check Hero.tsx and HeroArtboard.tsx viewport settings
- Verify SiteHeader responsive classes (lg:, sm:)

---

## 📞 Support

**Issues post-deploy:**
1. Check Vercel dashboard build logs
2. Verify main branch is deployed
3. Clear browser cache (Ctrl+Shift+Delete)
4. Test on different device/network

**Rollback if needed:**
```bash
# Revert to previous deployment
vercel rollback
```

---

**Deploy Ready:** ✅ YES
**Commit Hash:** d1e634b
**Branch:** main
**Next Step:** Execute deploy and run Resource Living campaigns

---

*Estimated time to live: 5-10 minutes from deploy start*
