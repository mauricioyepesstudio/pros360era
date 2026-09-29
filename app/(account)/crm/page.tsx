"use client";

import { useEffect, useState } from "react";
import { BarChart3, Phone, MessageSquare, Target, CheckCircle2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";

interface DashboardData {
  totalLeads: number;
  leadsThisMonth: number;
  leadsBySource: Record<string, number>;
  conversationsByChannel: Record<string, number>;
  openConversations: number;
  tasksOverdue: number;
  tasksToday: number;
  opportunitiesInPipeline: number;
  pipelineValue: number;
  conversionRate: number;
}

export default function CRMPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/crm/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="CRM"
          title="Cargando..."
          description="Preparando tu dashboard de ventas"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Error"
          title="No disponible"
          description="No pudimos cargar el dashboard"
        />
      </div>
    );
  }

  const metrics = [
    {
      label: "Leads totales",
      value: data.totalLeads,
      icon: BarChart3,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Leads este mes",
      value: data.leadsThisMonth,
      icon: AlertCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Conversaciones abiertas",
      value: data.openConversations,
      icon: MessageSquare,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Tareas vencidas",
      value: data.tasksOverdue,
      icon: AlertCircle,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Oportunidades",
      value: data.opportunitiesInPipeline,
      icon: Target,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Tasa de conversión",
      value: `${data.conversionRate.toFixed(1)}%`,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CRM"
        title="Panel de ventas"
        description="Gestiona leads, conversaciones y oportunidades"
      />

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div
              key={idx}
              className={`rounded-lg ${metric.color} p-6`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">{metric.label}</p>
                  <p className="mt-2 text-3xl font-bold">{metric.value}</p>
                </div>
                <Icon size={24} className="opacity-50" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Value */}
      <div className="rounded-lg border border-[var(--border)] bg-white p-6">
        <h3 className="font-bold text-[var(--brand-navy)]">Valor del pipeline</h3>
        <p className="mt-2 text-4xl font-bold text-[var(--brand-blue)]">
          ${data.pipelineValue.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          En {data.opportunitiesInPipeline} oportunidades activas
        </p>
      </div>

      {/* Sources & Channels */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Leads by Source */}
        <div className="rounded-lg border border-[var(--border)] bg-white p-6">
          <h3 className="font-bold text-[var(--brand-navy)]">Leads por fuente</h3>
          <div className="mt-4 space-y-2">
            {Object.entries(data.leadsBySource).length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Sin datos aún</p>
            ) : (
              Object.entries(data.leadsBySource).map(([source, count]) => (
                <div key={source} className="flex justify-between text-sm">
                  <span className="capitalize">{source}</span>
                  <strong>{count}</strong>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversations by Channel */}
        <div className="rounded-lg border border-[var(--border)] bg-white p-6">
          <h3 className="font-bold text-[var(--brand-navy)]">Conversaciones por canal</h3>
          <div className="mt-4 space-y-2">
            {Object.entries(data.conversationsByChannel).length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Sin datos aún</p>
            ) : (
              Object.entries(data.conversationsByChannel).map(([channel, count]) => (
                <div key={channel} className="flex justify-between text-sm">
                  <span className="capitalize">{channel}</span>
                  <strong>{count}</strong>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border-2 border-[var(--brand-blue)] bg-blue-50 p-6">
        <h3 className="font-bold text-[var(--brand-navy)]">Acciones rápidas</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <a
            href="/crm/leads"
            className="inline-block rounded-lg bg-white px-4 py-3 font-semibold text-[var(--brand-blue)] hover:bg-gray-50 transition-colors"
          >
            → Ver todos los leads
          </a>
          <a
            href="/crm/conversations"
            className="inline-block rounded-lg bg-white px-4 py-3 font-semibold text-[var(--brand-blue)] hover:bg-gray-50 transition-colors"
          >
            → Conversaciones
          </a>
          <a
            href="/crm/pipeline"
            className="inline-block rounded-lg bg-white px-4 py-3 font-semibold text-[var(--brand-blue)] hover:bg-gray-50 transition-colors"
          >
            → Ver pipeline
          </a>
        </div>
      </div>
    </div>
  );
}
