-- Growth Automation Profiles table
CREATE TABLE IF NOT EXISTS growth_automation_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'cancelled')),
  activated_at TIMESTAMP WITH TIME ZONE,

  -- Platform connections
  instagram_connected BOOLEAN DEFAULT FALSE,
  tiktok_connected BOOLEAN DEFAULT FALSE,
  youtube_connected BOOLEAN DEFAULT FALSE,

  -- Automation settings
  auto_publish BOOLEAN DEFAULT TRUE,
  posts_per_day INTEGER DEFAULT 2 CHECK (posts_per_day BETWEEN 1 AND 5),
  auto_respond_comments BOOLEAN DEFAULT TRUE,
  lead_qualification_enabled BOOLEAN DEFAULT TRUE,

  -- Revenue tracking
  total_leads_generated INTEGER DEFAULT 0,
  total_revenue_generated NUMERIC(10, 2) DEFAULT 0,
  platform_commission_percentage INTEGER DEFAULT 30,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT user_one_profile UNIQUE(user_id)
);

-- Social Media Accounts table (OAuth connections)
CREATE TABLE IF NOT EXISTS social_media_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES growth_automation_profiles(id) ON DELETE CASCADE,

  -- Platform & account info
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube')),
  account_id TEXT NOT NULL,
  username TEXT,
  profile_picture_url TEXT,

  -- OAuth tokens (encrypted in production)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Current metrics
  followers_count INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5, 2) DEFAULT 0,
  media_count INTEGER DEFAULT 0,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_platform_per_profile UNIQUE(profile_id, platform)
);

-- Published Posts tracking table
CREATE TABLE IF NOT EXISTS automated_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES growth_automation_profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES social_media_accounts(id) ON DELETE CASCADE,

  -- Post content
  content_text TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,

  -- Publishing status
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed')),
  published_at TIMESTAMP WITH TIME ZONE,

  -- Performance metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5, 2) DEFAULT 0,

  -- Timestamps
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Qualified Leads table
CREATE TABLE IF NOT EXISTS qualified_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES growth_automation_profiles(id) ON DELETE CASCADE,

  -- Lead info
  name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp_number TEXT,

  -- Source & qualification
  source_platform TEXT CHECK (source_platform IN ('instagram', 'tiktok', 'youtube', 'comment', 'dm')),
  qualification_score INTEGER DEFAULT 0 CHECK (qualification_score BETWEEN 0 AND 100),
  qualification_reason TEXT,

  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'disqualified', 'converted')),
  contacted_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,

  -- Revenue impact
  estimated_deal_value NUMERIC(10, 2),
  actual_revenue NUMERIC(10, 2),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE growth_automation_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualified_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can see own profile"
  ON growth_automation_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON growth_automation_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON growth_automation_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can see own accounts"
  ON social_media_accounts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM growth_automation_profiles
    WHERE id = social_media_accounts.profile_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own accounts"
  ON social_media_accounts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM growth_automation_profiles
    WHERE id = social_media_accounts.profile_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can see own posts"
  ON automated_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM growth_automation_profiles
    WHERE id = automated_posts.profile_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can see own leads"
  ON qualified_leads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM growth_automation_profiles
    WHERE id = qualified_leads.profile_id
    AND user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_ga_profiles_user_id ON growth_automation_profiles(user_id);
CREATE INDEX idx_sma_profile_id ON social_media_accounts(profile_id);
CREATE INDEX idx_sma_platform ON social_media_accounts(platform);
CREATE INDEX idx_ap_profile_id ON automated_posts(profile_id);
CREATE INDEX idx_ap_status ON automated_posts(status);
CREATE INDEX idx_ql_profile_id ON qualified_leads(profile_id);
CREATE INDEX idx_ql_status ON qualified_leads(status);
