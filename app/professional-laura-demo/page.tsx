"use client";

import { useState } from "react";
import { ChevronRight, BarChart3, MessageCircle, TrendingUp, Users, DollarSign } from "lucide-react";
import Link from "next/link";

export default function LauraDemoPage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);
  const [hoveredLead, setHoveredLead] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">DEMO INTERACTIVO</div>
            <h1 className="text-3xl font-bold text-gray-900">1MIGRATION</h1>
            <p className="text-sm text-gray-600 mt-1">Lo que pasaría en 30 días automatizando tu crecimiento</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">+$3,500</div>
            <div className="text-sm text-gray-600">Tu ganancia (Mes 1)</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-6 mb-12 border-b border-gray-200 pb-6">
          <button
            onClick={() => setActiveTab("posts")}
            className={`text-lg font-semibold pb-3 border-b-2 transition-all ${
              activeTab === "posts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📱 Posts que se publican automáticamente
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`text-lg font-semibold pb-3 border-b-2 transition-all ${
              activeTab === "leads"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            💬 Leads que entran automáticamente
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`text-lg font-semibold pb-3 border-b-2 transition-all ${
              activeTab === "results"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📈 Resultados en 30 días
          </button>
        </div>

        {/* TAB 1: POSTS */}
        {activeTab === "posts" && (
          <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="font-bold text-gray-900 mb-2">¿Qué ve Laura?</h2>
              <p className="text-gray-700">El sistema genera y publica 2-3 posts automáticamente cada día basados en tu nicho (inmigración). Estos son ejemplos reales:</p>
            </div>

            {/* Post 1 */}
            <div
              className="border-2 border-gray-200 rounded-lg p-8 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer relative"
              onMouseEnter={() => setHoveredPost(1)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xl">
                  1M
                </div>
                <div>
                  <p className="font-bold text-gray-900">1MIGRATION</p>
                  <p className="text-sm text-gray-500">Hoy • 10:30 AM</p>
                </div>
              </div>

              <p className="text-gray-800 text-lg leading-relaxed mb-4">
                &ldquo;Como gestora de inmigración, sé que el visa EB-3 no es fácil de obtener. Pero con una estrategia correcta, puedes obtenerlo en 2-3 años. Aquí te comparto los pasos clave...&rdquo;
              </p>

              <div className="flex gap-3 mb-6">
                <span className="text-blue-600 font-semibold text-sm">#Immigration</span>
                <span className="text-blue-600 font-semibold text-sm">#EB3Visa</span>
                <span className="text-blue-600 font-semibold text-sm">#USImmigration</span>
              </div>

              <div className="flex gap-6 text-sm text-gray-600 border-t border-gray-200 pt-4">
                <span>❤️ 890 likes</span>
                <span>💬 145 comentarios</span>
                <span>↗️ 234 shares</span>
              </div>

              {hoveredPost === 1 && (
                <div className="absolute top-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg text-sm max-w-xs">
                  ✓ Sistema generó este post automáticamente basado en tendencias de inmigración + engagement histórico
                </div>
              )}
            </div>

            {/* Post 2 */}
            <div
              className="border-2 border-gray-200 rounded-lg p-8 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer relative"
              onMouseEnter={() => setHoveredPost(2)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xl">
                  1M
                </div>
                <div>
                  <p className="font-bold text-gray-900">1MIGRATION</p>
                  <p className="text-sm text-gray-500">Ayer • 2:45 PM</p>
                </div>
              </div>

              <p className="text-gray-800 text-lg leading-relaxed mb-4">
                &ldquo;¿Sabías que el 78% de mis clientes obtuvieron su green card porque entendieron el proceso correcto? La mayoría pierde dinero con abogados que NO explican nada. Aquí está la verdad...&rdquo;
              </p>

              <div className="flex gap-3 mb-6">
                <span className="text-blue-600 font-semibold text-sm">#GreenCard</span>
                <span className="text-blue-600 font-semibold text-sm">#ImmigrationLaw</span>
                <span className="text-blue-600 font-semibold text-sm">#VisaProcess</span>
              </div>

              <div className="flex gap-6 text-sm text-gray-600 border-t border-gray-200 pt-4">
                <span>❤️ 1,240 likes</span>
                <span>💬 203 comentarios</span>
                <span>↗️ 456 shares</span>
              </div>

              {hoveredPost === 2 && (
                <div className="absolute top-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg text-sm max-w-xs">
                  ✓ Engagement real: este tipo de post genera 2-3x más interacción
                </div>
              )}
            </div>

            {/* Post 3 */}
            <div
              className="border-2 border-gray-200 rounded-lg p-8 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer relative"
              onMouseEnter={() => setHoveredPost(3)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xl">
                  1M
                </div>
                <div>
                  <p className="font-bold text-gray-900">1MIGRATION</p>
                  <p className="text-sm text-gray-500">3 días atrás • 8:15 PM</p>
                </div>
              </div>

              <p className="text-gray-800 text-lg leading-relaxed mb-4">
                &ldquo;El TPS está cambiando en 2026. Si tienes TPS, NECESITAS hacer esto AHORA antes de que sea demasiado tarde. Los que actúan hoy estarán protegidos...&rdquo;
              </p>

              <div className="flex gap-3 mb-6">
                <span className="text-blue-600 font-semibold text-sm">#TPS</span>
                <span className="text-blue-600 font-semibold text-sm">#Immigration</span>
                <span className="text-blue-600 font-semibold text-sm">#ActNow</span>
              </div>

              <div className="flex gap-6 text-sm text-gray-600 border-t border-gray-200 pt-4">
                <span>❤️ 2,156 likes</span>
                <span>💬 389 comentarios</span>
                <span>↗️ 678 shares</span>
              </div>

              {hoveredPost === 3 && (
                <div className="absolute top-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg text-sm max-w-xs">
                  ✓ Urgencia + valor = máximo engagement. Este tipo de posts generan leads HOT
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="font-bold text-green-900 mb-2">✓ El sistema hace esto:</p>
              <ul className="space-y-2 text-green-800">
                <li>• Genera posts automáticamente cada día (2-3 posts/día)</li>
                <li>• Basados en tu nicho + tendencias + engagement histórico</li>
                <li>• Publica en el horario óptimo para tu audiencia</li>
                <li>• Monitorea engagement y aprende qué funciona</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: LEADS */}
        {activeTab === "leads" && (
          <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="font-bold text-gray-900 mb-2">¿Qué ve Laura?</h2>
              <p className="text-gray-700">Cada día, el sistema captura leads automáticamente de múltiples canales (Instagram, WhatsApp, Email). Los agrupa en un solo lugar (CRM) y los califica por probabilidad de compra:</p>
            </div>

            {/* Leads Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-gray-900">Nombre del Lead</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-900">De dónde vino</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-900">Qué preguntó</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-900">Probabilidad de Compra</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "María García", source: "📸 Instagram Comment", query: "EB-3 Visa", hot: true },
                    { name: "Carlos López", source: "💬 WhatsApp", query: "Green Card Process", hot: false },
                    { name: "Ana Martínez", source: "📧 Email", query: "Consultation", hot: true },
                    { name: "José Rodríguez", source: "💬 IG DM", query: "TPS Question", hot: false },
                    { name: "Sofia Pérez", source: "📸 Instagram Comment", query: "Work Visa", hot: true },
                    { name: "Juan Torres", source: "📧 Email", query: "Visa Options", hot: false },
                  ].map((lead, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors relative"
                      onMouseEnter={() => setHoveredLead(lead.name)}
                      onMouseLeave={() => setHoveredLead(null)}
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900">{lead.name}</td>
                      <td className="px-6 py-4 text-gray-700">{lead.source}</td>
                      <td className="px-6 py-4 text-gray-700">{lead.query}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-4 py-2 rounded-full font-semibold text-sm ${
                            lead.hot
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {lead.hot ? "🔥 HOT" : "⏳ Warm"}
                        </span>
                      </td>
                      {hoveredLead === lead.name && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-3 rounded-lg text-sm max-w-xs whitespace-nowrap">
                          ✓ Sistema calificó automáticamente
                        </div>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="text-blue-600 text-3xl font-bold mb-2">+6</div>
                <p className="text-sm text-blue-900">Leads de Instagram (comentarios)</p>
                <p className="text-xs text-blue-700 mt-2">Hoy</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-green-600 text-3xl font-bold mb-2">+4</div>
                <p className="text-sm text-green-900">Leads de WhatsApp (mensajes)</p>
                <p className="text-xs text-green-700 mt-2">Hoy</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="text-purple-600 text-3xl font-bold mb-2">+2</div>
                <p className="text-sm text-purple-900">Leads de Email (consultas)</p>
                <p className="text-xs text-purple-700 mt-2">Hoy</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="font-bold text-green-900 mb-2">✓ El sistema hace esto:</p>
              <ul className="space-y-2 text-green-800">
                <li>• Monitorea Instagram (comentarios + DMs)</li>
                <li>• Captura mensajes de WhatsApp entrantes</li>
                <li>• Recibe emails y consultas automáticamente</li>
                <li>• Califica cada lead (HOT = alta probabilidad de compra)</li>
                <li>• Todo en un CRM multicanal (un solo lugar)</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 3: RESULTS */}
        {activeTab === "results" && (
          <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="font-bold text-gray-900 mb-2">¿Qué ve Laura?</h2>
              <p className="text-gray-700">Después de 30 días con el sistema funcionando, esto es lo que espera ver en su dashboard:</p>
            </div>

            {/* MES 1 */}
            <div className="border-2 border-blue-300 rounded-lg p-8 bg-gradient-to-br from-blue-50 to-white">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">📊 MES 1 - Resultados</h3>

              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Seguidores */}
                <div className="bg-white border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="text-blue-600" size={28} />
                    <p className="font-semibold text-gray-700">Nuevos Seguidores</p>
                  </div>
                  <p className="text-5xl font-bold text-blue-600">+200</p>
                  <p className="text-sm text-gray-600 mt-2">~7 por día (automático)</p>
                </div>

                {/* Leads */}
                <div className="bg-white border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle className="text-green-600" size={28} />
                    <p className="font-semibold text-gray-700">Leads Calificados</p>
                  </div>
                  <p className="text-5xl font-bold text-green-600">18-20</p>
                  <p className="text-sm text-gray-600 mt-2">De todos tus canales</p>
                </div>

                {/* Conversiones */}
                <div className="bg-white border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="text-purple-600" size={28} />
                    <p className="font-semibold text-gray-700">Clientes Nuevos</p>
                  </div>
                  <p className="text-5xl font-bold text-purple-600">5-7</p>
                  <p className="text-sm text-gray-600 mt-2">25% conversion rate</p>
                </div>

                {/* Ingresos */}
                <div className="bg-white border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="text-yellow-600" size={28} />
                    <p className="font-semibold text-gray-700">Ingresos Totales</p>
                  </div>
                  <p className="text-5xl font-bold text-yellow-600">$5,000</p>
                  <p className="text-sm text-gray-600 mt-2">Proyectado</p>
                </div>
              </div>

              <div className="bg-blue-900 text-white rounded-lg p-6">
                <p className="font-bold text-lg mb-2">💰 TU PARTE (70%):</p>
                <p className="text-4xl font-bold">$3,500+</p>
                <p className="text-sm mt-2 text-blue-100">La plataforma retiene 30% ($1,500) para mantener la automatización</p>
              </div>
            </div>

            {/* Calculation Box */}
            <div className="bg-gray-900 text-white rounded-lg p-8">
              <h4 className="font-bold text-lg mb-4">📐 Cómo se calcula:</h4>
              <ul className="space-y-3 text-sm">
                <li>✓ <strong>+200 seguidores:</strong> basado en nicho immigration + engagement histórico</li>
                <li>✓ <strong>18-20 leads:</strong> de Instagram, WhatsApp, Email combinados</li>
                <li>✓ <strong>25% conversion:</strong> tu rate típica (18 leads × 25% = 4.5 → 5 clientes)</li>
                <li>✓ <strong>$1,000 por cliente:</strong> precio promedio de tus servicios</li>
                <li>✓ <strong>$5,000 ingresos:</strong> 5 clientes × $1,000</li>
                <li>✓ <strong>$3,500 para ti:</strong> 70% del total</li>
              </ul>
            </div>

            {/* 3-Month total */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 text-center">
              <p className="text-lg mb-2">En 3 meses con automatización 24/7:</p>
              <p className="text-5xl font-bold">$24,500</p>
              <p className="text-blue-100 text-lg mt-2">Esto es lo que ganarías</p>
              <p className="text-blue-200 text-sm mt-4">(Mes 1: $3,500 + Mes 2: $8,400 + Mes 3: $12,600)</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="font-bold text-green-900 mb-2">✓ Sin hacer nada extra:</p>
              <ul className="space-y-2 text-green-800">
                <li>• El sistema publica por ti</li>
                <li>• El sistema captura leads por ti</li>
                <li>• El sistema califica leads por ti</li>
                <li>• Tú solo respondes cuando quieras</li>
                <li>• 0 costo inicial</li>
              </ul>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para ver esto en acción?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Abre tu cuenta de 1MIGRATION en 5 minutos y comienza HOY mismo
          </p>
          <Link
            href="/professional-invite"
            className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            Empezar Ahora
            <ChevronRight size={24} />
          </Link>
        </div>
      </main>
    </div>
  );
}
