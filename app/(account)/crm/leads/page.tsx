"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";
import Link from "next/link";
import { leadStatusLabels } from "@/lib/crm/followup";

interface Lead {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  source: string;
  status: string;
  qualification_score: number;
  created_at: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (searchTerm) params.set("q", searchTerm);

    const controller = new AbortController();
    fetch(`/api/crm/leads?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        const payload = await response.json();
        if (!Array.isArray(payload.data)) throw new Error("Invalid response");
        if (!controller.signal.aborted) { setLeads(payload.data); setError(false); }
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [searchTerm, statusFilter, attempt]);

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-purple-100 text-purple-800",
    qualified: "bg-green-100 text-green-800",
    unqualified: "bg-gray-100 text-gray-800",
    converted: "bg-emerald-100 text-emerald-800",
    lost: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Leads"
        title="Gestión de prospectos"
        description="Registra prospectos y revisa tus contactos guardados."
      />

      {/* Actions & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-[var(--muted)]" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => { setLoading(true); setSearchTerm(e.target.value); }}
              className="w-full rounded-lg border border-[var(--border)] pl-10 py-2 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setLoading(true); setStatusFilter(e.target.value); }}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="new">Nuevo</option>
            <option value="contacted">Contactado</option>
            <option value="qualified">Calificado</option>
            <option value="converted">Convertido</option>
            <option value="lost">Perdido</option>
          </select>
        </div>

        <Link
          href="/crm/leads/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-blue)] px-4 py-2 font-semibold text-white hover:bg-[var(--brand-navy)] transition-colors"
        >
          <Plus size={18} />
          Nuevo lead
        </Link>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)]">Cargando...</div>
        ) : error ? (
          <div className="p-8 text-center" role="alert"><p>No pudimos cargar tus prospectos. Intenta de nuevo.</p><button type="button" className="mt-3 font-bold text-[var(--brand-blue)]" onClick={() => { setLoading(true); setAttempt((value) => value + 1); }}>Intentar de nuevo</button></div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-[var(--muted)]">
            Sin leads. <Link href="/crm/leads/new" className="text-[var(--brand-blue)] underline">Crear uno</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-[var(--border)] bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Teléfono</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Fuente</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>

              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-[var(--border)] hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/crm/leads/${lead.id}`} className="font-semibold text-[var(--brand-blue)] underline">{lead.name || "Abrir prospecto"}</Link>
                  </td>
                  <td className="px-6 py-4 text-sm">{lead.email || "-"}</td>
                  <td className="px-6 py-4 text-sm">{lead.phone || "-"}</td>
                  <td className="px-6 py-4 text-sm capitalize">{lead.source}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColors[lead.status] || "bg-gray-100"}`}>
                      {leadStatusLabels[lead.status as keyof typeof leadStatusLabels] || lead.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
