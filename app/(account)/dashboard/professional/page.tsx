"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Users, Plug, User, Bot, TrendingUp, MessageSquare, HelpCircle } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";

export default function ProfessionalDashboard() {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const sections = [
    {
      id: "growth",
      title: "🚀 Crecimiento Automático",
      description: "Publica contenido, capta leads y crece tu audiencia automáticamente",
      icon: Zap,
      href: "/growth-automation",
      stats: [
        { label: "Seguidores este mes", value: "+0", color: "text-blue-600" },
        { label: "Leads capturados", value: "0", color: "text-green-600" },
      ],
      tooltip: "Conecta Instagram y activa la automatización de contenido. El sistema publicará 2-3 posts diarios y responderá comentarios con IA.",
    },
    {
      id: "crm",
      title: "👥 Gestión de Clientes",
      description: "Administra leads, conversaciones y oportunidades de venta",
      icon: Users,
      href: "/crm",
      stats: [
        { label: "Leads activos", value: "0", color: "text-purple-600" },
        { label: "Conversiones", value: "0%", color: "text-orange-600" },
      ],
      tooltip: "Tu CRM multicanal: WhatsApp, Instagram, Facebook, Email. Todos los leads en un solo lugar. Pipeline de ventas integrado.",
    },
    {
      id: "conexiones",
      title: "🔗 Mis Conexiones",
      description: "Miembros de EVOLUSA que están usando tus servicios",
      icon: Plug,
      href: "/conexiones",
      stats: [
        { label: "Conexiones activas", value: "0", color: "text-indigo-600" },
        { label: "Tasa de engagement", value: "0%", color: "text-pink-600" },
      ],
      tooltip: "Aquí ves a todos los miembros que eligieron trabajar contigo. Mantén el contacto y expande tu red.",
    },
    {
      id: "perfil",
      title: "👤 Mi Perfil Profesional",
      description: "Tu marca 1MIGRATION y configuración profesional",
      icon: User,
      href: "/perfil",
      stats: [
        { label: "Perfil completitud", value: "85%", color: "text-green-600" },
        { label: "Visibilidad", value: "Alto", color: "text-blue-600" },
      ],
      tooltip: "Configura tu marca, agregá tu foto, descripción y enlaces. Los clientes ven esta información cuando buscan profesionales.",
    },
    {
      id: "asistente",
      title: "🤖 Asistente IA",
      description: "Tu asistente de IA para crear contenido y responder mensajes",
      icon: Bot,
      href: "/asistente",
      stats: [
        { label: "Contenido generado", value: "0", color: "text-cyan-600" },
        { label: "Tiempo ahorrado", value: "0 hrs", color: "text-teal-600" },
      ],
      tooltip: "Crea posts, responde mensajes, genera propuestas. El asistente aprende de tu estilo y adapta las respuestas.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <PageHeader
          eyebrow="Tu Panel de Control"
          title="Bienvenida a 1MIGRATION"
          description="Gestiona tu crecimiento, clientes y automatización en un solo lugar"
        />
      </div>

      {/* Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Proyección Mes 1</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">+200</p>
              <p className="text-xs text-blue-600 mt-1">Nuevos seguidores esperados</p>
            </div>
            <TrendingUp className="text-blue-400" size={40} />
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Leads Calificados</p>
              <p className="text-3xl font-bold text-green-900 mt-2">18-20</p>
              <p className="text-xs text-green-600 mt-1">Mes 1 automáticamente</p>
            </div>
            <MessageSquare className="text-green-400" size={40} />
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Ingresos Proyectados</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">$5K+</p>
              <p className="text-xs text-purple-600 mt-1">Tu parte: $3.5K+ (70%)</p>
            </div>
            <Zap className="text-purple-400" size={40} />
          </div>
        </div>
      </div>

      {/* Secciones Principales */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Tus Herramientas</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.id}
                href={section.href}
                className="group rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-50 p-3">
                        <Icon className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      </div>
                    </div>

                    {/* Tooltip Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTooltip(showTooltip === section.id ? null : section.id);
                        }}
                        className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                        title="Más info"
                      >
                        <HelpCircle size={20} />
                      </button>

                      {/* Tooltip */}
                      {showTooltip === section.id && (
                        <div className="absolute right-0 top-8 z-10 w-64 rounded-lg bg-gray-900 text-white p-4 text-sm shadow-lg">
                          <p>{section.tooltip}</p>
                          <div className="absolute -top-2 right-6 w-4 h-4 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    {section.stats.map((stat, idx) => (
                      <div key={idx} className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-600">{stat.label}</p>
                        <p className={`text-lg font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                    Acceder
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Video Tutorial Section */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
        <h3 className="text-xl font-bold mb-2">¿Cómo Empezar?</h3>
        <p className="text-blue-100 mb-6">Mira nuestro video tutorial de 3 minutos para entender cómo funciona la automatización de 1MIGRATION</p>
        <Link
          href="/growth-automation/demo"
          className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Ver Demo Interactivo
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Revenue Split Info */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <h3 className="font-bold text-green-900">Tu Modelo de Ingresos</h3>
        <p className="text-green-700 mt-2 text-sm">
          Tú recibes el <strong>70%</strong> de todos los ingresos generados a través de 1MIGRATION.
          EVOLUSA mantiene el 30% para operar la plataforma y la automatización.
          <strong> Sin costos iniciales, sin riesgo.</strong>
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">70%</p>
            <p className="text-xs text-green-700 mt-1">Para ti</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-green-600">÷</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">30%</p>
            <p className="text-xs text-green-700 mt-1">Plataforma</p>
          </div>
        </div>
      </div>
    </div>
  );
}
