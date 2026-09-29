"use client";

import { useState } from "react";
import { ArrowRight, TrendingUp, MessageSquare, DollarSign, Zap, BarChart3, Users } from "lucide-react";
import Link from "next/link";
import BrandMark from "@/components/evolusa/BrandMark";

const DEMO_POSTS = [
  {
    id: 1,
    content: "Como gestora de inmigración, sé que el visa EB-3 no es fácil de obtener. Pero con una estrategia correcta, puedes obtenerlo en 2-3 años. Aquí te comparto los pasos clave...",
    hashtags: "#Immigration #EB3Visa #USImmigration",
    engagement: "890 likes • 145 comments",
    date: "Hoy 10:30 AM",
  },
  {
    id: 2,
    content: "¿Sabías que el 78% de mis clientes obtuvieron su green card porque entendieron el proceso correcto? La mayoría pierde dinero con abogados que NO explican nada. Aquí está la verdad...",
    hashtags: "#GreenCard #ImmigrationLaw #VisaProcess",
    engagement: "1,240 likes • 203 comments",
    date: "Ayer 2:45 PM",
  },
  {
    id: 3,
    content: "El TPS está cambiando en 2026. Si tienes TPS, NECESITAS hacer esto AHORA antes de que sea demasiado tarde. Los que actúan hoy estarán protegidos...",
    hashtags: "#TPS #Immigration #ActNow",
    engagement: "2,156 likes • 389 comments",
    date: "3 días atrás",
  },
];

const DAILY_LEADS = [
  { name: "María García", source: "Instagram Comment", intent: "EB-3 Visa info", status: "Hot" },
  { name: "Carlos López", source: "WhatsApp", intent: "Green Card process", status: "Warm" },
  { name: "Ana Martínez", source: "Email", intent: "Consultation", status: "Hot" },
  { name: "José Rodríguez", source: "IG DM", intent: "TPS question", status: "Warm" },
];

export default function ProfessionalDemoPage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedMonth, setSelectedMonth] = useState(1);

  const projections = {
    1: { followers: 200, leads: 18, conversions: 5, revenue: 5000 },
    2: { followers: 450, leads: 42, conversions: 12, revenue: 12000 },
    3: { followers: 800, leads: 68, conversions: 18, revenue: 18000 },
  };

  const monthData = projections[selectedMonth as keyof typeof projections];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <BrandMark size="sm" />
          </Link>
          <div className="text-sm text-slate-300">
            Demo Interactivo - 1MIGRATION
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Esto es lo que pasaría en 30 días
          </h1>
          <p className="text-xl text-slate-300">
            Automatización de contenido + Captura de leads + Propuestas de servicios
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "posts"
                ? "border-blue-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            📱 Posts Automáticos
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "leads"
                ? "border-blue-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            💬 Leads Capturados Hoy
          </button>
          <button
            onClick={() => setActiveTab("projections")}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
              activeTab === "projections"
                ? "border-blue-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            📈 Proyecciones 30 Días
          </button>
        </div>

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-6">
            <p className="text-slate-300 mb-6">
              Estos son 3 ejemplos de los 2-3 posts que se publicarían automáticamente cada día:
            </p>
            {DEMO_POSTS.map((post) => (
              <div
                key={post.id}
                className="rounded-lg bg-slate-800 border border-slate-700 p-6 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    1M
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">1MIGRATION</p>
                    <p className="text-xs text-slate-400">{post.date}</p>
                  </div>
                </div>

                <p className="text-white leading-relaxed mb-4">{post.content}</p>

                <p className="text-sm text-blue-400 mb-4">{post.hashtags}</p>

                <div className="flex gap-6 text-sm text-slate-400 border-t border-slate-700 pt-4">
                  <span className="flex items-center gap-2">
                    <Zap size={16} />
                    {post.engagement}
                  </span>
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-6 text-center">
              <p className="text-green-400 font-semibold">
                ✓ El sistema genera estos automáticamente cada día
              </p>
              <p className="text-sm text-green-300 mt-2">
                Basado en tu nicho + tendencias + engagement histórico
              </p>
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <div className="space-y-6">
            <p className="text-slate-300 mb-6">
              Estos son algunos de los leads que se capturaron HOY automáticamente:
            </p>

            <div className="rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      De dónde vino
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Intención
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                      Calificación
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {DAILY_LEADS.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{lead.name}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{lead.source}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{lead.intent}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            lead.status === "Hot"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 p-4">
                <p className="text-sm text-blue-300">Instagram</p>
                <p className="text-2xl font-bold text-blue-400 mt-2">+6</p>
                <p className="text-xs text-blue-300 mt-1">leads comentando</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 p-4">
                <p className="text-sm text-green-300">WhatsApp</p>
                <p className="text-2xl font-bold text-green-400 mt-2">+4</p>
                <p className="text-xs text-green-300 mt-1">mensajes entrantes</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 p-4">
                <p className="text-sm text-purple-300">Email</p>
                <p className="text-2xl font-bold text-purple-400 mt-2">+2</p>
                <p className="text-xs text-purple-300 mt-1">consultas</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-6">
              <p className="text-green-400 font-semibold flex items-center gap-2">
                <CheckCircle size={20} />
                El CRM multicanal agrupa TODO automáticamente
              </p>
              <p className="text-sm text-green-300 mt-2">
                Todos tus leads en un solo lugar. El sistema califica qué tan cercanos están de comprar.
              </p>
            </div>
          </div>
        )}

        {/* Projections Tab */}
        {activeTab === "projections" && (
          <div className="space-y-6">
            <p className="text-slate-300 mb-6">
              Esto es lo que proyectamos para cada mes:
            </p>

            <div className="flex gap-4 mb-8">
              {[1, 2, 3].map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedMonth === month
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Mes {month}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-lg bg-slate-800 border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-blue-400" size={24} />
                  <p className="text-slate-400">Nuevos Seguidores</p>
                </div>
                <p className="text-4xl font-bold text-blue-400">+{monthData.followers}</p>
                <p className="text-xs text-slate-400 mt-2">
                  Promedio: {Math.round(monthData.followers / 30)} por día
                </p>
              </div>

              <div className="rounded-lg bg-slate-800 border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="text-green-400" size={24} />
                  <p className="text-slate-400">Leads Capturados</p>
                </div>
                <p className="text-4xl font-bold text-green-400">{monthData.leads}</p>
                <p className="text-xs text-slate-400 mt-2">
                  De todos tus canales
                </p>
              </div>

              <div className="rounded-lg bg-slate-800 border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-purple-400" size={24} />
                  <p className="text-slate-400">Conversiones (Clientes)</p>
                </div>
                <p className="text-4xl font-bold text-purple-400">{monthData.conversions}</p>
                <p className="text-xs text-slate-400 mt-2">
                  Con tu tasa de cierre
                </p>
              </div>

              <div className="rounded-lg bg-slate-800 border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="text-yellow-400" size={24} />
                  <p className="text-slate-400">Ingresos Totales</p>
                </div>
                <p className="text-4xl font-bold text-yellow-400">${monthData.revenue.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-2">
                  Tu parte: ${Math.round(monthData.revenue * 0.7).toLocaleString()} (70%)
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-6">
              <h3 className="font-bold text-yellow-400 mb-3">Cálculo de Proyecciones</h3>
              <div className="space-y-2 text-sm text-yellow-300">
                <p>📊 Seguidores: +200 por mes (basado en nicho immigration)</p>
                <p>💬 Leads: 18-20 por mes (desde Instagram, WhatsApp, Email)</p>
                <p>✅ Conversión: ~25% de los leads se convierten en clientes</p>
                <p>💰 Precio promedio servicio: ~$1000</p>
                <p>🤝 Split: 70% profesional, 30% plataforma</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-blue-400 mb-2">
                En 3 meses: ${Math.round((5000 + 12000 + 18000) * 0.7).toLocaleString()}
              </h3>
              <p className="text-slate-300">
                Esto es lo que ganarías con la automatización funcionando 24/7
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para ver esto en acción?
          </h2>
          <p className="text-blue-100 mb-8">
            Completa tu cuenta en 5 minutos y comienza HOY mismo
          </p>
          <Link
            href="/professional-invite"
            className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            Empezar Ahora
            <ArrowRight size={24} />
          </Link>
        </div>
      </main>
    </div>
  );
}

function CheckCircle({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
