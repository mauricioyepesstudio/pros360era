"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, MessageSquare, Target, CheckCircle2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";

import { parseCRMDashboardResponse, type DashboardData } from "@/lib/crm/dashboard-response";

export default function CRMPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/crm/dashboard", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("CRM unavailable");
        return parseCRMDashboardResponse(await response.json());
      })
      .then((dashboard) => { if (!controller.signal.aborted) setData(dashboard); })
      .catch(() => { if (!controller.signal.aborted) setData(null); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

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
          description="No pudimos cargar tus datos. No se muestran cifras hasta obtener una respuesta válida."
        />
        <button type="button" onClick={() => { setLoading(true); setData(null); setAttempt((value) => value + 1); }} className="rounded-lg bg-[var(--brand-blue)] px-5 py-3 font-bold text-white">Intentar de nuevo</button>
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
        description="Gestiona prospectos y conversaciones aquí. Las oportunidades que los miembros de EVOLUSA autorizaron compartir contigo se consultan en tu panel profesional; no se suman como leads del CRM hasta estar registradas."
      />

      <section className="rounded-lg border border-[var(--brand-blue)] bg-white p-6" aria-labelledby="evolusa-assignments-title">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-blue)]">EVOLUSA · Solicitudes asignadas</p>
        <h2 id="evolusa-assignments-title" className="mt-2 text-xl font-bold text-[var(--brand-navy)]">
          Revisa tus oportunidades con consentimiento
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">
          Cada solicitud se consulta mediante la cuenta del profesional al que fue asignada.
          Solo verás la información que el cliente autorizó compartir. Las solicitudes no se
          convierten automáticamente en prospectos del CRM, y todavía no se envían alertas por correo.
        </p>
        <Link
          href="/panel-profesional/oportunidades"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--brand-navy)] px-5 font-bold text-white hover:bg-[var(--brand-blue)]"
        >
          Ver oportunidades asignadas →
        </Link>
      </section>

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
                  <p className="mt-2 text-3xl font-bold">{metric.value ?? "En preparación"}</p>
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
          {data.pipelineValue === null ? "En preparación" : "$" + data.pipelineValue.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {data.opportunitiesInPipeline === null ? "Pipeline aún no disponible" : `En ${data.opportunitiesInPipeline} oportunidades activas`}
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
            {(data.conversationsByChannel === null || Object.entries(data.conversationsByChannel).length === 0) ? (
              <p className="text-sm text-[var(--muted)]">{data.conversationsByChannel === null ? "En preparación" : "Sin datos aún"}</p>
            ) : (
              Object.entries(data.conversationsByChannel ?? {}).map(([channel, count]) => (
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
          <Link
            href="/crm/leads"
            className="inline-block rounded-lg bg-white px-4 py-3 font-semibold text-[var(--brand-blue)] hover:bg-gray-50 transition-colors"
          >
            → Ver todos los leads
          </Link>
          <Link
            href="/crm/conversations"
            className="inline-block rounded-lg bg-white px-4 py-3 font-semibold text-[var(--brand-blue)] hover:bg-gray-50 transition-colors"
          >
            → Conversaciones de Instagram
          </Link>

        </div>
      </div>
    </div>
  );
}
