-- CRM Pipeline & Tasks: Sales pipeline stages and activity tracking

-- ===============================================================
-- PIPELINE STAGES: Configurable sales pipeline
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0, -- sort order

  -- Configuration
  color TEXT DEFAULT '#3B82F6', -- hex color for UI
  is_final_stage BOOLEAN DEFAULT FALSE, -- marks won/lost/closed
  probability_percentage INTEGER CHECK (probability_percentage BETWEEN 0 AND 100),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, name)
);

-- ===============================================================
-- OPPORTUNITIES: Sales pipeline items (lead -> opportunity -> deal)
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,

  -- Pipeline positioning
  title TEXT NOT NULL,
  description TEXT,
  stage_id UUID NOT NULL REFERENCES public.crm_pipeline_stages(id) ON DELETE RESTRICT,

  -- Financial tracking
  deal_value NUMERIC(12, 2),
  currency TEXT DEFAULT 'USD',
  estimated_close_date DATE,
  probability_percentage INTEGER CHECK (probability_percentage BETWEEN 0 AND 100),
  weighted_value NUMERIC(12, 2), -- deal_value * probability_percentage / 100

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'on_hold')),
  close_reason TEXT CHECK (close_reason IN ('won', 'lost_competitor', 'lost_budget', 'lost_timing', 'lost_other', NULL)),

  -- Tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,

  INDEX(user_id, stage_id, status),
  INDEX(assigned_to, status),
  INDEX(created_at DESC)
);

-- ===============================================================
-- OPPORTUNITY HISTORY: Track stage movements
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_opportunity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.crm_opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  from_stage_id UUID REFERENCES public.crm_pipeline_stages(id) ON DELETE SET NULL,
  to_stage_id UUID NOT NULL REFERENCES public.crm_pipeline_stages(id) ON DELETE RESTRICT,

  moved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  INDEX(opportunity_id, created_at DESC)
);

-- ===============================================================
-- TASKS: Activities, follow-ups, reminders
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Linking (optional - can be for contact or opportunity or standalone)
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.crm_opportunities(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.crm_conversations(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('call', 'email', 'meeting', 'follow_up', 'reminder', 'other')),

  -- Assignment
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Due date
  due_date DATE NOT NULL,
  due_time TIME,

  -- Status
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled', 'overdue')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Reminders
  reminder_at TIMESTAMPTZ, -- when to send reminder
  reminded BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  INDEX(user_id, status, due_date),
  INDEX(assigned_to, status),
  INDEX(contact_id, status),
  INDEX(due_date, status)
);

-- ===============================================================
-- TASK ACTIVITIES: Log of task changes
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_task_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.crm_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'assigned', 'status_changed', 'due_date_changed', 'commented')),
  old_value TEXT,
  new_value TEXT,
  comment TEXT,

  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===============================================================
-- INDEXES
-- ===============================================================
CREATE INDEX idx_crm_pipeline_stages_user_id ON public.crm_pipeline_stages(user_id, order_index);

CREATE INDEX idx_crm_opportunities_user_id ON public.crm_opportunities(user_id);
CREATE INDEX idx_crm_opportunities_contact_id ON public.crm_opportunities(contact_id);
CREATE INDEX idx_crm_opportunities_stage_id ON public.crm_opportunities(stage_id);
CREATE INDEX idx_crm_opportunities_assigned_to ON public.crm_opportunities(assigned_to);
CREATE INDEX idx_crm_opportunities_status ON public.crm_opportunities(status);
CREATE INDEX idx_crm_opportunities_close_date ON public.crm_opportunities(estimated_close_date);

CREATE INDEX idx_crm_opp_history_opportunity_id ON public.crm_opportunity_history(opportunity_id, created_at DESC);

CREATE INDEX idx_crm_tasks_user_id ON public.crm_tasks(user_id);
CREATE INDEX idx_crm_tasks_assigned_to ON public.crm_tasks(assigned_to);
CREATE INDEX idx_crm_tasks_contact_id ON public.crm_tasks(contact_id);
CREATE INDEX idx_crm_tasks_opportunity_id ON public.crm_tasks(opportunity_id);
CREATE INDEX idx_crm_tasks_due_date ON public.crm_tasks(due_date, status);
CREATE INDEX idx_crm_tasks_status ON public.crm_tasks(status);

CREATE INDEX idx_crm_task_activities_task_id ON public.crm_task_activities(task_id, created_at DESC);

-- ===============================================================
-- RLS POLICIES
-- ===============================================================
ALTER TABLE public.crm_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunity_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_task_activities ENABLE ROW LEVEL SECURITY;

-- Pipeline stages: users see only their own
CREATE POLICY "Users can view own pipeline stages"
  ON public.crm_pipeline_stages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage pipeline stages"
  ON public.crm_pipeline_stages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pipeline stages"
  ON public.crm_pipeline_stages
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Opportunities: users see only their own
CREATE POLICY "Users can view own opportunities"
  ON public.crm_opportunities
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create opportunities"
  ON public.crm_opportunities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own opportunities"
  ON public.crm_opportunities
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Opportunity history: accessible via opportunity
CREATE POLICY "Access opportunity history via opportunity"
  ON public.crm_opportunity_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_opportunities
      WHERE id = opportunity_id AND user_id = auth.uid()
    )
  );

-- Tasks: users see only their own and assigned to them
CREATE POLICY "Users can view own and assigned tasks"
  ON public.crm_tasks
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can create tasks"
  ON public.crm_tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.crm_tasks
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Task activities: accessible via task
CREATE POLICY "Access task activities via task"
  ON public.crm_task_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_tasks
      WHERE id = task_id AND (user_id = auth.uid() OR assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can create task activities"
  ON public.crm_task_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
