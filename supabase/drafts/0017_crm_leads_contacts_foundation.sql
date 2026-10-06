-- CRM Foundation: Leads, Contacts, Tags
-- EVOLUSA multicanal CRM for prospect capture, management, and pipeline

-- ===============================================================
-- LEADS TABLE: Initial prospect capture from any source
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Source and capture
  source TEXT NOT NULL CHECK (source IN ('website', 'whatsapp', 'instagram', 'facebook', 'email', 'referral', 'other')),
  source_url TEXT, -- where did the lead come from

  -- Contact info (may be incomplete at capture time)
  name TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,

  -- Lead qualification
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost')),
  qualification_score INTEGER DEFAULT 0 CHECK (qualification_score BETWEEN 0 AND 100),

  -- Organization
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- sales rep or team member

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  notes TEXT,

  -- Tracking
  first_contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, email) -- prevent duplicate emails per user
);

-- ===============================================================
-- CONTACTS TABLE: Unified contact record per lead
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Primary contact
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,

  -- Company/Professional context
  company_name TEXT,
  job_title TEXT,
  industry TEXT,

  -- Classification
  contact_type TEXT NOT NULL DEFAULT 'prospect' CHECK (contact_type IN ('prospect', 'client', 'partner', 'other')),
  lifecycle_stage TEXT NOT NULL DEFAULT 'lead' CHECK (lifecycle_stage IN ('lead', 'mql', 'sql', 'opportunity', 'customer', 'closed_lost')),

  -- Preferences and consent
  opted_in_email BOOLEAN DEFAULT TRUE,
  opted_in_whatsapp BOOLEAN DEFAULT TRUE,
  opted_in_sms BOOLEAN DEFAULT FALSE,
  gdpr_consented BOOLEAN DEFAULT FALSE,
  gdpr_consented_at TIMESTAMPTZ,

  -- Links
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Metadata
  custom_fields JSONB DEFAULT '{}'::jsonb, -- extensible custom data

  -- Tracking
  last_contacted_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, email) -- one email per user
);

-- ===============================================================
-- TAGS TABLE: Categorize leads/contacts
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6', -- hex color for UI
  description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, name) -- one tag name per user
);

-- ===============================================================
-- CONTACT_TAGS: Junction table
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_contact_tags (
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.crm_tags(id) ON DELETE CASCADE,

  PRIMARY KEY (contact_id, tag_id)
);

-- ===============================================================
-- LEAD HISTORY: Audit trail for lead state changes
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_lead_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  field_name TEXT NOT NULL, -- 'status', 'assigned_to', 'qualification_score'
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  INDEX(lead_id, created_at)
);

-- ===============================================================
-- INDEXES
-- ===============================================================
CREATE INDEX idx_crm_leads_user_id ON public.crm_leads(user_id);
CREATE INDEX idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX idx_crm_leads_source ON public.crm_leads(source);
CREATE INDEX idx_crm_leads_assigned_to ON public.crm_leads(assigned_to);
CREATE INDEX idx_crm_leads_created_at ON public.crm_leads(created_at DESC);

CREATE INDEX idx_crm_contacts_user_id ON public.crm_contacts(user_id);
CREATE INDEX idx_crm_contacts_email ON public.crm_contacts(email);
CREATE INDEX idx_crm_contacts_lifecycle_stage ON public.crm_contacts(lifecycle_stage);
CREATE INDEX idx_crm_contacts_assigned_to ON public.crm_contacts(assigned_to);

CREATE INDEX idx_crm_contact_tags_tag_id ON public.crm_contact_tags(tag_id);

-- ===============================================================
-- RLS POLICIES
-- ===============================================================
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_history ENABLE ROW LEVEL SECURITY;

-- Leads: users see only their own leads
CREATE POLICY "Users can view own leads"
  ON public.crm_leads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create leads"
  ON public.crm_leads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON public.crm_leads
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Contacts: users see only their own contacts
CREATE POLICY "Users can view own contacts"
  ON public.crm_contacts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create contacts"
  ON public.crm_contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts"
  ON public.crm_contacts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Tags: users see only their own tags
CREATE POLICY "Users can view own tags"
  ON public.crm_tags
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tags"
  ON public.crm_tags
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON public.crm_tags
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Contact tags: accessible if contact is accessible
CREATE POLICY "Access contact tags via contact"
  ON public.crm_contact_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_contacts
      WHERE id = contact_id AND user_id = auth.uid()
    )
  );

-- Lead history: accessible if lead is accessible
CREATE POLICY "Access lead history via lead"
  ON public.crm_lead_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_leads
      WHERE id = lead_id AND user_id = auth.uid()
    )
  );
