// CRM Domain Types
// Reflects database schema and business logic

// ===============================================================
// LEADS
// ===============================================================
export type LeadSource = 'website' | 'whatsapp' | 'instagram' | 'facebook' | 'email' | 'referral' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';

export interface Lead {
  id: string;
  userId: string;
  source: LeadSource;
  sourceUrl?: string;
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  status: LeadStatus;
  qualificationScore: number;
  assignedTo?: string;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
  firstContactedAt?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadHistory {
  id: string;
  leadId: string;
  userId: string;
  fieldName: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  createdAt: string;
}

// ===============================================================
// CONTACTS
// ===============================================================
export type ContactType = 'prospect' | 'client' | 'partner' | 'other';
export type LifecycleStage = 'lead' | 'mql' | 'sql' | 'opportunity' | 'customer' | 'closed_lost';

export interface Contact {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  companyName?: string;
  jobTitle?: string;
  industry?: string;
  contactType: ContactType;
  lifecycleStage: LifecycleStage;
  optedInEmail: boolean;
  optedInWhatsapp: boolean;
  optedInSms: boolean;
  gdprConsented: boolean;
  gdprConsentedAt?: string;
  assignedTo?: string;
  customFields?: Record<string, unknown>;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

export interface ContactWithTags extends Contact {
  tags: Tag[];
}

// ===============================================================
// CONVERSATIONS
// ===============================================================
export type Channel = 'whatsapp' | 'instagram' | 'facebook' | 'email' | 'manual';
export type ConversationStatus = 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed' | 'archived';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageType = 'text' | 'image' | 'file' | 'location' | 'reaction';

export interface Conversation {
  id: string;
  userId: string;
  contactId: string;
  channel: Channel;
  channelId?: string;
  status: ConversationStatus;
  assignedTo?: string;
  subject?: string;
  priority: MessagePriority;
  lastMessageAt?: string;
  customerResponseTime?: string;
  firstResponseTime?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  contactId: string;
  userId: string;
  messageText: string;
  attachmentUrls?: string[];
  direction: MessageDirection;
  sentByContact: boolean;
  externalMessageId?: string;
  messageType: MessageType;
  createdAt: string;
}

export interface ConversationNote {
  id: string;
  conversationId: string;
  userId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  role: 'owner' | 'participant' | 'observer';
  joinedAt: string;
  lastReadAt?: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
  notes: ConversationNote[];
  participants: ConversationParticipant[];
}

// ===============================================================
// PIPELINE & OPPORTUNITIES
// ===============================================================
export interface PipelineStage {
  id: string;
  userId: string;
  name: string;
  description?: string;
  orderIndex: number;
  color: string;
  isFinalStage: boolean;
  probabilityPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export type OpportunityStatus = 'active' | 'won' | 'lost' | 'on_hold';
export type CloseReason = 'won' | 'lost_competitor' | 'lost_budget' | 'lost_timing' | 'lost_other';

export interface Opportunity {
  id: string;
  userId: string;
  contactId: string;
  title: string;
  description?: string;
  stageId: string;
  dealValue?: number;
  currency: string;
  estimatedCloseDate?: string;
  probabilityPercentage?: number;
  weightedValue?: number;
  assignedTo?: string;
  status: OpportunityStatus;
  closeReason?: CloseReason;
  createdAt: string;
  updatedAt: string;
  wonAt?: string;
  lostAt?: string;
}

export interface OpportunityHistory {
  id: string;
  opportunityId: string;
  userId: string;
  fromStageId?: string;
  toStageId: string;
  movedBy?: string;
  reason?: string;
  createdAt: string;
}

// ===============================================================
// TASKS
// ===============================================================
export type TaskType = 'call' | 'email' | 'meeting' | 'follow_up' | 'reminder' | 'other';
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id: string;
  userId: string;
  contactId?: string;
  opportunityId?: string;
  conversationId?: string;
  title: string;
  description?: string;
  taskType: TaskType;
  assignedTo: string;
  dueDate: string;
  dueTime?: string;
  status: TaskStatus;
  completedAt?: string;
  completedBy?: string;
  priority: TaskPriority;
  reminderAt?: string;
  reminded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  activityType: 'created' | 'assigned' | 'status_changed' | 'due_date_changed' | 'commented';
  oldValue?: string;
  newValue?: string;
  comment?: string;
  changedBy?: string;
  createdAt: string;
}

// ===============================================================
// CRM METRICS & ANALYTICS
// ===============================================================
export interface CRMDashboard {
  totalLeads: number;
  leadsThisMonth: number;
  leadsBySource: Record<LeadSource, number>;
  conversationsByChannel: Record<Channel, number>;
  openConversations: number;
  avgResponseTime: number; // in minutes
  avgFirstResponseTime: number;
  tasksOverdue: number;
  tasksToday: number;
  opportunitiesInPipeline: number;
  pipelineValue: number;
  conversionRate: number; // percentage
}

export interface UserPerformance {
  userId: string;
  userName: string;
  leadsAssigned: number;
  conversationsAssigned: number;
  avgResponseTime: number;
  conversionRate: number;
  tasksCompleted: number;
  tasksOverdue: number;
  totalRevenue: number;
}

// ===============================================================
// API RESPONSES
// ===============================================================
export interface CRMListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CRMError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
