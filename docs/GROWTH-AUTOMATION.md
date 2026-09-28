# Growth Automation Module - EVOLUSA

## Overview

Growth Automation is a new service within EVOLUSA that enables professionals (especially those in services like immigration, visas, bookkeeping, etc.) to automate their social media growth and lead generation.

**Status**: Phase 1 (MVP) - Connection & Dashboard  
**Launch Date**: September 28, 2026  
**Service ID**: `growth-automation`  
**Category**: `MARKETING`  

## What It Does

1. **Automatic Publishing**: 2-3 optimized posts per day across Instagram, TikTok, YouTube
2. **AI Comment Responses**: Automatic replies to 80% of comments
3. **Lead Qualification**: WhatsApp automation that qualifies leads automatically
4. **Real-time Analytics**: Metrics updated every 6 hours
5. **Revenue Transparency**: 70/30 split - 70% to professional, 30% to platform

## Architecture

### Routes Created

```
/app/(account)/growth-automation/
├── page.tsx                 # Main dashboard
├── layout.tsx               # Layout for module
└── connect/
    └── page.tsx             # Network connection flow
```

### Service Definition

File: `data/services/services.ts`

```typescript
{
  id: "growth-automation",
  slug: "crecimiento-automatico",
  name: "Automatización de crecimiento para profesionales",
  category: "MARKETING",
  stageIds: ["CRECE", "EVOLUCIONA"],
  fulfillmentType: "DIRECT",
  enabled: true,
  featured: true,
  // ... see services.ts for full definition
}
```

### Navigation

The module appears in the account sidebar and mobile nav:
- Icon: 🚀 Rocket
- Label: "Crecimiento 🚀"
- URL: `/growth-automation`
- Visible to: All roles (MEMBER, PROFESSIONAL, ADMIN)

## User Journey (Phase 1)

```
1. Professional opens EVOLUSA dashboard
   ↓
2. Clicks "Crecimiento 🚀" in sidebar
   ↓
3. Sees overview of system (projections, features)
   ↓
4. Clicks "Activar crecimiento" or "Conectar mis redes"
   ↓
5. Sees platforms available (Instagram, TikTok, YouTube)
   ↓
6. Clicks "Conectar ahora" on Instagram (only ready platform)
   ↓
7. OAuth flow to authorize account
   ↓
8. System fetches current metrics (followers, recent posts, analytics)
   ↓
9. Returns to dashboard showing real-time metrics
   ↓
10. Tomorrow: automated posting begins
```

## Data Model (Phase 1 MVP)

### Required Database Tables

See `/prisma/schema.prisma` for full schema. Key tables:

```sql
-- Growth automation profile (one per user who activates)
growth_automation_profiles {
  id: UUID
  user_id: UUID
  status: "pending" | "active" | "paused" | "cancelled"
  activated_at: timestamp
  instagram_connected: boolean
  tiktok_connected: boolean
  youtube_connected: boolean
  auto_publish: boolean
  posts_per_day: int
  auto_respond_comments: boolean
  lead_qualification_enabled: boolean
  created_at: timestamp
  updated_at: timestamp
}

-- Connected social accounts (OAuth tokens encrypted)
social_media_accounts {
  id: UUID
  profile_id: UUID (FK)
  platform: "instagram" | "tiktok" | "youtube"
  account_id: varchar
  access_token_encrypted: varchar
  refresh_token_encrypted: varchar
  expires_at: timestamp
  followers: int
  last_synced: timestamp
}
```

## API Endpoints (Phase 2+)

```
POST   /api/growth-automation/connect/:platform       # Start OAuth flow
GET    /api/growth-automation/callback/:platform      # OAuth callback
GET    /api/growth-automation/accounts                # List connected accounts
GET    /api/growth-automation/metrics                 # Fetch real-time metrics
POST   /api/growth-automation/content/publish         # Queue post for publishing
GET    /api/growth-automation/analytics               # Real-time dashboard data
GET    /api/growth-automation/leads                   # List qualified leads
POST   /api/growth-automation/leads/contact           # Send lead contact via WhatsApp
GET    /api/growth-automation/revenue                 # Revenue tracking (70/30)
```

## Features by Phase

### Phase 1 (MVP - CURRENT)
- ✅ Dashboard showing system overview
- ✅ Network connection page (UI ready)
- ✅ Integration in EVOLUSA navigation
- ⏳ OAuth connection (backend)
- ⏳ Real-time metrics display (backend)

### Phase 2 (Content Publishing)
- Automatic content calendar
- AI content generation
- Scheduled publishing to Instagram, TikTok, YouTube
- Post performance tracking

### Phase 3 (Lead Qualification)
- WhatsApp automation setup
- AI-powered lead qualification
- Lead scoring and routing
- CRM integration

### Phase 4 (Advanced Analytics)
- Competitive analysis
- Trend detection
- Revenue tracking and payouts
- Monthly settlement reports

## Compliance

- **Category**: MARKETING
- **Default Fulfillment**: DIRECT
- **Verification Required**: No
- **Enabled by Default**: Yes
- **Disclaimers**: None (pure marketing/operational tool)

See `/lib/evolusa-compliance/` for how compliance is enforced.

## Revenue Model

```
Service Price (example): $2,000 (for 1 visa tramitated/closed)

Split:
- Professional receives: $1,400 (70%)
- Platform receives:    $600 (30%)

Why 30%?
- System development & maintenance
- API costs (Meta, TikTok, YouTube)
- AI automation costs
- WhatsApp Business integration
- Lead routing infrastructure
- Revenue tracking & payouts
```

## Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Navigation link appears in sidebar
- [ ] Connection page shows all 3 platforms
- [ ] Instagram connection shows as "ready"
- [ ] TikTok/YouTube show as "coming soon"
- [ ] All copy is accurate and in Spanish
- [ ] Mobile nav shows growth-automation tab
- [ ] Mobile responsive design works

## Known Limitations (Phase 1)

1. No actual OAuth implementation yet (comes Phase 2)
2. No metrics fetching (comes Phase 2)
3. No content publishing (comes Phase 2)
4. No lead qualification (comes Phase 3)
5. No revenue tracking (comes Phase 4)

## Next Steps

1. **Phase 2 Sprint**: Implement OAuth for Instagram, metrics fetching, real-time dashboard
2. **User Testing**: Get Laura (1Migration) to test connection flow
3. **API Development**: Build content publishing pipeline
4. **Integration**: Connect to lead CRM, WhatsApp automation

## Related Documents

- Architecture: See EvolUSA product architecture in `/docs/EVOLUSA-PRODUCT.md`
- Services model: `/data/services/types.ts`
- Compliance: `/data/compliance/claims.ts`
- Layout: `/components/account/AccountShell.tsx`
