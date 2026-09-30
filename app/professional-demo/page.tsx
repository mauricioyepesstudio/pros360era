"use client";

import { useState } from "react";
import { ArrowRight, TrendingUp, MessageSquare, DollarSign, Zap, BarChart3, Users, CheckCircle2, Sparkles, Rocket } from "lucide-react";
import Link from "next/link";

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
  const [activeTab, setActiveTab] = useState("explicacion");
  const [selectedMonth, setSelectedMonth] = useState(1);

  const projections = {
    1: { followers: 200, leads: 18, conversions: 5, revenue: 5000 },
    2: { followers: 450, leads: 42, conversions: 12, revenue: 12000 },
    3: { followers: 800, leads: 68, conversions: 18, revenue: 18000 },
  };

  const monthData = projections[selectedMonth as keyof typeof projections];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: '#061B3A', borderBottom: '3px solid #F20D24' }}>
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#2563EB' }}>1M</div>
            <div>
              <div className="text-sm" style={{ color: '#EFF6FF' }}>Plataforma de Automatización</div>
              <div className="text-xl font-bold" style={{ color: '#F20D24' }}>1MIGRATION</div>
            </div>
          </div>
          <div className="text-sm" style={{ color: '#EFF6FF' }}>
            Para Profesionales de Inmigración
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#061B3A' }}>
            Tu Marca Crece 24/7
          </h1>
          <p className="text-xl mb-8" style={{ color: '#064748B' }}>
            Nosotros creamos el contenido. Nosotros capturamos los leads. Tú ganas dinero.
          </p>
          <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: '#2563EB', color: 'white' }}>
            ✅ 70% de los ingresos es TUYO
          </div>
          <div>
            <Link
              href="/professional-demo-tutorial"
              className="inline-block px-6 py-3 rounded-lg font-bold text-sm mr-4"
              style={{ backgroundColor: '#2563EB', color: 'white' }}
            >
              ▶️ Ver Paso a Paso (Interactivo)
            </Link>
          </div>
        </div>

        {/* Tabs como Cards */}
        <div className="mb-12 grid grid-cols-2 gap-6">
          <button
            onClick={() => setActiveTab("explicacion")}
            className="p-6 rounded-lg font-semibold transition-all text-center"
            style={{
              backgroundColor: activeTab === "explicacion" ? '#F20D24' : '#EFF6FF',
              color: activeTab === "explicacion" ? 'white' : '#061B3A',
              border: activeTab === "explicacion" ? '3px solid #F20D24' : '2px solid #2563EB'
            }}
          >
            ❓ Cómo Funciona
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className="p-6 rounded-lg font-semibold transition-all text-center"
            style={{
              backgroundColor: activeTab === "posts" ? '#F20D24' : '#EFF6FF',
              color: activeTab === "posts" ? 'white' : '#061B3A',
              border: activeTab === "posts" ? '3px solid #F20D24' : '2px solid #2563EB'
            }}
          >
            📱 Posts Automáticos
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className="p-6 rounded-lg font-semibold transition-all text-center"
            style={{
              backgroundColor: activeTab === "leads" ? '#F20D24' : '#EFF6FF',
              color: activeTab === "leads" ? 'white' : '#061B3A',
              border: activeTab === "leads" ? '3px solid #F20D24' : '2px solid #2563EB'
            }}
          >
            💬 Leads Capturados
          </button>
          <button
            onClick={() => setActiveTab("projections")}
            className="p-6 rounded-lg font-semibold transition-all text-center"
            style={{
              backgroundColor: activeTab === "projections" ? '#F20D24' : '#EFF6FF',
              color: activeTab === "projections" ? 'white' : '#061B3A',
              border: activeTab === "projections" ? '3px solid #F20D24' : '2px solid #2563EB'
            }}
          >
            📈 Resultados 30 Días
          </button>
        </div>

        {/* Explicación Tab */}
        {activeTab === "explicacion" && (
          <div className="space-y-8">
            {/* ¿Qué es? */}
            <div className="rounded-lg p-8" style={{ backgroundColor: '#EFF6FF', border: '3px solid #2563EB' }}>
              <div className="flex items-start gap-4 mb-4">
                <Sparkles className="flex-shrink-0" size={32} style={{ color: '#2563EB' }} />
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: '#061B3A' }}>¿Qué es 1MIGRATION?</h2>
                  <p className="text-lg" style={{ color: '#064748B' }}>
                    Una plataforma que <strong>automatiza TODO</strong> en tu marca de inmigración:
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                  <div>
                    <p className="font-semibold text-gray-900">Crea Contenido</p>
                    <p className="text-sm text-gray-600">Nuestros agentes generan 2-3 posts diarios</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                  <div>
                    <p className="font-semibold text-gray-900">Publica Automático</p>
                    <p className="text-sm text-gray-600">Salen directos a tu Instagram, optimizados</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                  <div>
                    <p className="font-semibold text-gray-900">Captura Leads</p>
                    <p className="text-sm text-gray-600">De Instagram, WhatsApp, Email automáticamente</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                  <div>
                    <p className="font-semibold text-gray-900">Propone Clientes</p>
                    <p className="text-sm text-gray-600">Te mostramos quién está listo para comprar</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ¿Quién hace qué? */}
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-lg p-6" style={{ backgroundColor: '#EFF6FF', border: '2px solid #2563EB' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Rocket size={28} style={{ color: '#2563EB' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#061B3A' }}>TÚ HACES:</h3>
                </div>
                <ul className="space-y-3" style={{ color: '#064748B' }}>
                  <li className="flex gap-2">
                    <CheckCircle2 size={20} className="flex-shrink-0" style={{ color: '#2563EB' }} />
                    <span>Conectas tu Instagram (1 vez)</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={20} className="flex-shrink-0" style={{ color: '#2563EB' }} />
                    <span>Respondes leads cuando quieras</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={20} className="flex-shrink-0" style={{ color: '#2563EB' }} />
                    <span>Cierras tus ventas</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={20} className="flex-shrink-0" style={{ color: '#2563EB' }} />
                    <span>¡Ganas 70% de cada venta!</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg p-6" style={{ backgroundColor: '#FEF4F4', border: '2px solid #F20D24' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Zap size={28} style={{ color: '#F20D24' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#061B3A' }}>NOSOTROS HACEMOS:</h3>
                </div>
                <ul className="space-y-3" style={{ color: '#064748B' }}>
                  <li className="flex gap-2">
                    <CheckCircle2 size={20} className="flex-shrink-0" style={{ color: '#F20D24' }} />
                    <span>Creamos contenido con IA</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={20} className="flex-shrink-0" style={{ color: '#F20D24' }} />
                    <span>Publicamos automáticamente 24/7</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={20} className="flex-shrink-0" style={{ color: '#F20D24' }} />
                    <span>Capturamos todos los leads</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={20} className="flex-shrink-0" style={{ color: '#F20D24' }} />
                    <span>Te los presentamos organizados</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Resultado */}
            <div className="text-white rounded-lg p-8 text-center" style={{ backgroundColor: '#061B3A' }}>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#F20D24' }}>El Resultado en 30 Días:</h3>
              <p className="text-lg mb-6" style={{ color: '#EFF6FF' }}>Mientras tú duermes, tu marca crece automáticamente</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#2563EB' }}>+200</p>
                  <p className="text-sm" style={{ color: '#EFF6FF' }}>Nuevos Seguidores</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#2563EB' }}>18-20</p>
                  <p className="text-sm" style={{ color: '#EFF6FF' }}>Leads Calificados</p>
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: '#F20D24' }}>$3,500+</p>
                  <p className="text-sm" style={{ color: '#EFF6FF' }}>Tu Ganancia (70%)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-6">
            <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: '#EFF6FF', border: '2px solid #2563EB' }}>
              <p className="font-semibold" style={{ color: '#061B3A' }}>
                📱 Estos son ejemplos de los posts que el sistema crea y publica automáticamente cada día:
              </p>
              <p className="text-sm mt-2" style={{ color: '#64748B' }}>
                Totalmente optimizados para tu nicho (inmigración), basados en tendencias reales y diseñados para máximo engagement.
              </p>
            </div>

            {DEMO_POSTS.map((post) => (
              <div
                key={post.id}
                className="rounded-lg bg-white border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    1M
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">1MIGRATION</p>
                    <p className="text-xs text-gray-500">{post.date}</p>
                  </div>
                </div>

                <p className="text-gray-800 leading-relaxed mb-4 text-lg">{post.content}</p>

                <p className="text-sm text-blue-600 font-semibold mb-4">{post.hashtags}</p>

                <div className="flex gap-6 text-sm text-gray-600 border-t border-gray-200 pt-4">
                  <span className="flex items-center gap-2">
                    <Zap size={16} className="text-orange-600" />
                    {post.engagement}
                  </span>
                </div>
              </div>
            ))}

            <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#FEF4F4', border: '2px solid #F20D24' }}>
              <p className="font-bold text-lg" style={{ color: '#F20D24' }}>
                ✅ El sistema genera esto automáticamente cada día
              </p>
              <p className="text-sm mt-2" style={{ color: '#064748B' }}>
                No necesitas pensar en qué escribir. Nosotros lo creamos, optimizamos y publicamos.
              </p>
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <div className="space-y-6">
            <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: '#EFF6FF', border: '2px solid #2563EB' }}>
              <p className="font-semibold" style={{ color: '#061B3A' }}>
                💬 Estos son algunos de los leads capturados automáticamente HOY:
              </p>
              <p className="text-sm mt-2" style={{ color: '#64748B' }}>
                El sistema los obtiene de Instagram, WhatsApp y Email. Cada uno está calificado para que sepas quién está listo para comprar.
              </p>
            </div>

            <div className="rounded-lg bg-white border-2 border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                      De dónde vino
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                      Intención
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                      Calificación
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {DAILY_LEADS.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-semibold">{lead.name}</td>
                      <td className="px-6 py-4 text-gray-700 text-sm">{lead.source}</td>
                      <td className="px-6 py-4 text-gray-700 text-sm">{lead.intent}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            lead.status === "Hot"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {lead.status === "Hot" ? "🔥 HOT" : "🟡 Warm"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg p-4" style={{ backgroundColor: '#EFF6FF', border: '2px solid #2563EB' }}>
                <p className="text-sm font-bold" style={{ color: '#061B3A' }}>📸 Instagram</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#2563EB' }}>+6</p>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>comentarios/DMs</p>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: '#FEF4F4', border: '2px solid #F20D24' }}>
                <p className="text-sm font-bold" style={{ color: '#061B3A' }}>💬 WhatsApp</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#F20D24' }}>+4</p>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>mensajes</p>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: '#EFF6FF', border: '2px solid #2563EB' }}>
                <p className="text-sm font-bold" style={{ color: '#061B3A' }}>📧 Email</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#2563EB' }}>+2</p>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>consultas</p>
              </div>
            </div>

            <div className="text-white rounded-lg p-6" style={{ backgroundColor: '#2563EB' }}>
              <p className="font-bold text-lg flex items-center gap-2 mb-2">
                ✅ CRM Multicanal - Todo en UN SOLO LUGAR
              </p>
              <p className="text-sm">
                No necesitas revisar Instagram, WhatsApp y Email por separado. El sistema agrupa TODO, califica cada lead, y te dice quién está listo para comprar.
              </p>
            </div>
          </div>
        )}

        {/* Projections Tab */}
        {activeTab === "projections" && (
          <div className="space-y-6">
            <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: '#EFF6FF', border: '2px solid #2563EB' }}>
              <p className="font-semibold" style={{ color: '#061B3A' }}>
                📈 Proyecciones realistas basadas en datos históricos de profesionales similares:
              </p>
              <p className="text-sm mt-2" style={{ color: '#64748B' }}>
                Selecciona un mes para ver los números en detalle.
              </p>
            </div>

            <div className="flex gap-4 mb-8">
              {[1, 2, 3].map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-6 py-3 rounded-lg font-bold transition-all ${
                    selectedMonth === month
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Mes {month}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-lg bg-white border-2 border-blue-300 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-blue-600" size={28} />
                  <p className="text-gray-700 font-semibold">Nuevos Seguidores</p>
                </div>
                <p className="text-4xl font-bold text-blue-600">+{monthData.followers}</p>
                <p className="text-xs text-gray-600 mt-2">
                  Promedio: {Math.round(monthData.followers / 30)} por día
                </p>
              </div>

              <div className="rounded-lg bg-white border-2 border-green-300 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="text-green-600" size={28} />
                  <p className="text-gray-700 font-semibold">Leads Capturados</p>
                </div>
                <p className="text-4xl font-bold text-green-600">{monthData.leads}</p>
                <p className="text-xs text-gray-600 mt-2">
                  De Instagram, WhatsApp, Email
                </p>
              </div>

              <div className="rounded-lg bg-white border-2 border-purple-300 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-purple-600" size={28} />
                  <p className="text-gray-700 font-semibold">Nuevos Clientes</p>
                </div>
                <p className="text-4xl font-bold text-purple-600">{monthData.conversions}</p>
                <p className="text-xs text-gray-600 mt-2">
                  ~25% de conversión de leads
                </p>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-orange-100 to-yellow-100 border-2 border-orange-400 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="text-orange-600" size={28} />
                  <p className="text-gray-700 font-bold">INGRESOS TOTALES</p>
                </div>
                <p className="text-4xl font-bold text-orange-600">${monthData.revenue.toLocaleString()}</p>
                <p className="text-sm text-gray-700 font-bold mt-3 border-t-2 border-orange-300 pt-3">
                  TU GANANCIA (70%): <span className="text-orange-600">${Math.round(monthData.revenue * 0.7).toLocaleString()}</span>
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-400 p-6">
              <h3 className="font-bold text-orange-900 mb-4 text-lg">📐 Cómo se calculan estos números:</h3>
              <div className="space-y-2 text-sm text-orange-900">
                <p><strong>📊 Seguidores:</strong> +200 por mes (basado en nicho de inmigración + algoritmo Instagram)</p>
                <p><strong>💬 Leads:</strong> 18-20 por mes (desde Instagram DMs, comentarios, WhatsApp, Email)</p>
                <p><strong>✅ Conversión:</strong> ~25% de leads se convierten en clientes (promedio profesional)</p>
                <p><strong>💰 Precio promedio:</strong> ~$1,000 por cliente (consultoría de inmigración)</p>
                <p><strong>🤝 Tu ganancia:</strong> 70% de cada venta es tuya</p>
              </div>
            </div>

            <div className="text-white rounded-lg p-8 text-center" style={{ backgroundColor: '#061B3A' }}>
              <h3 className="text-3xl font-bold mb-2" style={{ color: '#F20D24' }}>
                En 3 Meses: ${Math.round((5000 + 12000 + 18000) * 0.7).toLocaleString()}
              </h3>
              <p className="text-lg mb-4" style={{ color: '#EFF6FF' }}>
                Tu ganancia acumulada mientras el sistema corre 24/7
              </p>
              <p className="text-sm" style={{ color: '#EFF6FF' }}>
                Mes 1: $3,500 + Mes 2: $8,400 + Mes 3: $12,600
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-lg p-10 text-center shadow-lg" style={{ backgroundColor: '#061B3A' }}>
          <h2 className="text-4xl font-bold mb-2" style={{ color: '#F20D24' }}>
            ¿Listo para transformar tu marca?
          </h2>
          <p className="mb-2 text-lg" style={{ color: '#EFF6FF' }}>
            Mientras tú atiendes clientes, nosotros hacemos crecer tu presencia 24/7
          </p>
          <p className="mb-8 font-semibold" style={{ color: '#2E8B57' }}>
            Sin costo inicial. Sin riesgo. 70% es tuyo.
          </p>
          <Link
            href="/signup?professional_invite=true"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-lg font-bold text-xl hover:shadow-xl transition-all"
            style={{ backgroundColor: '#F20D24', color: 'white' }}
          >
            Empezar Ahora - 5 Minutos
            <ArrowRight size={28} />
          </Link>
          <p className="text-sm mt-6" style={{ color: '#EFF6FF' }}>
            Conéctate con nosotros y en 30 días ves los resultados
          </p>
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
