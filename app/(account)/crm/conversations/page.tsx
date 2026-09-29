"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Clock, Filter } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";
import Link from "next/link";

interface Conversation {
  id: string;
  crm_contacts: { name: string; email: string };
  channel: string;
  status: string;
  subject?: string;
  last_message_at?: string;
  priority: string;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", statusFilter);

    fetch(`/api/crm/conversations?${params}`)
      .then((r) => r.json())
      .then((data) => setConversations(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const channelIcons: Record<string, string> = {
    whatsapp: "📱",
    instagram: "📸",
    facebook: "f",
    email: "✉️",
    manual: "👤",
  };

  const statusColors: Record<string, string> = {
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    waiting_for_customer: "bg-purple-100 text-purple-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
    archived: "bg-gray-50 text-gray-600",
  };

  const priorityColors: Record<string, string> = {
    low: "text-gray-500",
    normal: "text-blue-500",
    high: "text-orange-500",
    urgent: "text-red-500",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Conversaciones"
        title="Bandeja de mensajes"
        description="WhatsApp, Instagram, Facebook, Email"
      />

      {/* Filters */}
      <div className="flex gap-2">
        {["open", "in_progress", "waiting_for_customer", "resolved", "closed"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              statusFilter === status
                ? "bg-[var(--brand-blue)] text-white"
                : "bg-gray-100 text-[var(--muted)] hover:bg-gray-200"
            }`}
          >
            {status.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)]">Cargando...</div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted)]">
            Sin conversaciones en este estado
          </div>
        ) : (
          conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/crm/conversations/${conv.id}`}
              className="block rounded-lg border border-[var(--border)] bg-white p-4 hover:border-[var(--brand-blue)] hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{channelIcons[conv.channel] || "💬"}</span>
                    <h3 className="font-semibold text-[var(--brand-navy)]">
                      {conv.crm_contacts?.name || "Sin nombre"}
                    </h3>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                        statusColors[conv.status] || "bg-gray-100"
                      }`}
                    >
                      {conv.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {conv.subject || conv.crm_contacts?.email || "Sin asunto"}
                  </p>
                </div>
                <div className="text-right">
                  {conv.last_message_at && (
                    <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
                      <Clock size={14} />
                      {new Date(conv.last_message_at).toLocaleDateString("es-ES")}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
