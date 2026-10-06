-- CRM Conversations: Multichannel conversations with WhatsApp, IG, FB, Email

-- ===============================================================
-- CONVERSATIONS TABLE
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,

  -- Channel
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'instagram', 'facebook', 'email', 'manual')),
  channel_id TEXT, -- external ID from WhatsApp/IG/FB (e.g., phone number, IG handle)

  -- State
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed', 'archived')),

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Metadata
  subject TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Tracking
  last_message_at TIMESTAMPTZ,
  customer_response_time INTERVAL, -- time until customer responds
  first_response_time INTERVAL, -- time until first response

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,

  INDEX(user_id, status, created_at DESC)
);

-- ===============================================================
-- CONVERSATION MESSAGES
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.crm_conversations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message content
  message_text TEXT NOT NULL,
  attachment_urls TEXT[], -- array of URLs for images, files, etc.

  -- Direction
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sent_by_contact BOOLEAN NOT NULL, -- TRUE if from contact, FALSE if from team

  -- External reference
  external_message_id TEXT, -- WhatsApp message ID, IG message ID, etc.

  -- Metadata
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'location', 'reaction')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  INDEX(conversation_id, created_at DESC),
  INDEX(contact_id, created_at DESC)
);

-- ===============================================================
-- CONVERSATION PARTICIPANTS (internal team)
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.crm_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role
  role TEXT DEFAULT 'participant' CHECK (role IN ('owner', 'participant', 'observer')),

  -- Tracking
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,

  PRIMARY KEY (conversation_id, user_id)
);

-- ===============================================================
-- CONVERSATION NOTES: Internal team notes
-- ===============================================================
CREATE TABLE IF NOT EXISTS public.crm_conversation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.crm_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  note TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  INDEX(conversation_id, created_at DESC)
);

-- ===============================================================
-- INDEXES
-- ===============================================================
CREATE INDEX idx_crm_conversations_user_id ON public.crm_conversations(user_id);
CREATE INDEX idx_crm_conversations_contact_id ON public.crm_conversations(contact_id);
CREATE INDEX idx_crm_conversations_assigned_to ON public.crm_conversations(assigned_to);
CREATE INDEX idx_crm_conversations_status ON public.crm_conversations(status);
CREATE INDEX idx_crm_conversations_channel ON public.crm_conversations(channel);
CREATE INDEX idx_crm_conversations_created_at ON public.crm_conversations(created_at DESC);

CREATE INDEX idx_crm_messages_conversation_id ON public.crm_messages(conversation_id);
CREATE INDEX idx_crm_messages_direction ON public.crm_messages(direction);

CREATE INDEX idx_crm_participants_user_id ON public.crm_conversation_participants(user_id);
CREATE INDEX idx_crm_notes_conversation_id ON public.crm_conversation_notes(conversation_id);

-- ===============================================================
-- RLS POLICIES
-- ===============================================================
ALTER TABLE public.crm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_conversation_notes ENABLE ROW LEVEL SECURITY;

-- Conversations: users see only their own
CREATE POLICY "Users can view own conversations"
  ON public.crm_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
  ON public.crm_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.crm_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Messages: accessible if conversation is accessible
CREATE POLICY "Access messages via conversation"
  ON public.crm_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages"
  ON public.crm_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Participants: accessible if conversation is accessible
CREATE POLICY "Access participants via conversation"
  ON public.crm_conversation_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

-- Notes: accessible if conversation is accessible
CREATE POLICY "Access notes via conversation"
  ON public.crm_conversation_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes"
  ON public.crm_conversation_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
