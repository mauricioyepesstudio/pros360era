"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";

interface Slide {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

const slides: Slide[] = [
  {
    title: "El Problema",
    subtitle: "¿Por qué 1MIGRATION creció 10x?",
    content: (
      <div className="space-y-3">
        <p className="text-[var(--muted)]">Eres gestora de inmigración (como Laura):</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Trabajas muchas horas</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Las redes sociales consumen tiempo</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>No sabes cómo convertir seguidores en clientes</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Pierdes leads que vienen por Instagram</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>No tienes sistema para seguimiento</span>
          </li>
        </ul>
        <p className="text-lg font-semibold text-[var(--brand-blue)] mt-6">
          ¿Qué pasa si hubiera un sistema que lo hiciera TODO automático?
        </p>
      </div>
    ),
  },
  {
    title: "La Solución: 1MIGRATION",
    subtitle: "4 pasos automáticos para tu marca",
    content: (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-[var(--brand-blue)]">1️⃣</div>
          <h3 className="font-semibold mt-2">Generar</h3>
          <p className="text-sm text-[var(--muted)]">Publicación automática + IA</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-[var(--brand-blue)]">2️⃣</div>
          <h3 className="font-semibold mt-2">Capturar</h3>
          <p className="text-sm text-[var(--muted)]">Leads de Instagram automático</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-[var(--brand-blue)]">3️⃣</div>
          <h3 className="font-semibold mt-2">Gestionar</h3>
          <p className="text-sm text-[var(--muted)]">CRM multicanal</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-[var(--brand-blue)]">4️⃣</div>
          <h3 className="font-semibold mt-2">Vender</h3>
          <p className="text-sm text-[var(--muted)]">Cerrar deals</p>
        </div>
      </div>
    ),
  },
  {
    title: "Paso 1: Growth Automation",
    subtitle: "Publicación automática + IA",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-[var(--brand-blue)]">2-3</div>
            <p className="text-sm text-[var(--muted)] mt-1">Posts por día</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-[var(--brand-blue)]">80%</div>
            <p className="text-sm text-[var(--muted)] mt-1">Comentarios respondidos</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-[var(--brand-blue)]">20 min</div>
            <p className="text-sm text-[var(--muted)] mt-1">Setup inicial</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="font-semibold text-green-900">Resultado Mes 1:</p>
          <p className="text-sm text-green-800">+200 seguidores | Sin hacer nada</p>
        </div>
      </div>
    ),
  },
  {
    title: "Paso 2: Captura de Leads",
    subtitle: "Los leads llegan automáticamente desde Instagram",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--brand-blue)] text-white">
            <tr>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Fuente</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-3 py-2 font-semibold">María García</td>
              <td className="px-3 py-2">maria@email.com</td>
              <td className="px-3 py-2">Instagram</td>
              <td className="px-3 py-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">Nuevo</span>
              </td>
              <td className="px-3 py-2">85%</td>
            </tr>
            <tr className="border-b">
              <td className="px-3 py-2 font-semibold">Carlos López</td>
              <td className="px-3 py-2">carlos@email.com</td>
              <td className="px-3 py-2">Instagram</td>
              <td className="px-3 py-2">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">Contactado</span>
              </td>
              <td className="px-3 py-2">72%</td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-semibold">Ana Martínez</td>
              <td className="px-3 py-2">ana@email.com</td>
              <td className="px-3 py-2">Instagram</td>
              <td className="px-3 py-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Calificado</span>
              </td>
              <td className="px-3 py-2">92%</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    title: "Paso 3: CRM Dashboard",
    subtitle: "Métricas en tiempo real de tu negocio",
    content: (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-[var(--muted)] uppercase font-semibold">Leads totales</p>
          <div className="text-3xl font-bold text-[var(--brand-blue)] mt-1">127</div>
          <p className="text-xs text-green-600 mt-1">↑ 12 este mes</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-[var(--muted)] uppercase font-semibold">Conversaciones</p>
          <div className="text-3xl font-bold text-[var(--brand-blue)] mt-1">12</div>
          <p className="text-xs text-green-600 mt-1">Abiertas ahora</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-[var(--muted)] uppercase font-semibold">Oportunidades</p>
          <div className="text-3xl font-bold text-[var(--brand-blue)] mt-1">8</div>
          <p className="text-xs text-green-600 mt-1">💰 $15,600</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-[var(--muted)] uppercase font-semibold">Conversión</p>
          <div className="text-3xl font-bold text-[var(--brand-blue)] mt-1">18.5%</div>
          <p className="text-xs text-green-600 mt-1">↑ Vs mes pasado</p>
        </div>
      </div>
    ),
  },
  {
    title: "Paso 4: Conversaciones",
    subtitle: "Todos los canales en un solo lugar",
    content: (
      <div className="space-y-3">
        <div className="border border-[var(--border)] rounded-lg p-3 hover:bg-blue-50">
          <div className="flex items-center gap-2">
            <span className="text-lg">📱</span>
            <div>
              <h4 className="font-semibold">María García - WhatsApp</h4>
              <p className="text-xs text-[var(--muted)]">Estado: Abierto | Hace 2 horas</p>
            </div>
          </div>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-3 hover:bg-blue-50">
          <div className="flex items-center gap-2">
            <span className="text-lg">📸</span>
            <div>
              <h4 className="font-semibold">Carlos López - Instagram</h4>
              <p className="text-xs text-[var(--muted)]">Estado: En progreso | Hace 1 hora</p>
            </div>
          </div>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-3 hover:bg-blue-50">
          <div className="flex items-center gap-2">
            <span className="text-lg">f</span>
            <div>
              <h4 className="font-semibold">Ana Martínez - Facebook</h4>
              <p className="text-xs text-[var(--muted)]">Estado: Resuelto | Hace 30 min</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Paso 5: Pipeline de Ventas",
    subtitle: "Lead → Calificado → Deal → Cerrado",
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-2">
          <div className="bg-blue-50 rounded p-2 text-center">
            <div className="text-xl font-bold">1</div>
            <p className="text-xs mt-1">Nuevo</p>
            <p className="text-xs text-[var(--muted)]">$0</p>
          </div>
          <div className="bg-blue-50 rounded p-2 text-center">
            <div className="text-xl font-bold">2</div>
            <p className="text-xs mt-1">Contactado</p>
            <p className="text-xs text-[var(--muted)]">$0</p>
          </div>
          <div className="bg-green-50 rounded p-2 text-center">
            <div className="text-xl font-bold">3</div>
            <p className="text-xs mt-1">Calificado</p>
            <p className="text-xs text-green-600 font-semibold">+$2K</p>
          </div>
          <div className="bg-yellow-50 rounded p-2 text-center">
            <div className="text-xl font-bold">4</div>
            <p className="text-xs mt-1">Deal</p>
            <p className="text-xs text-yellow-600 font-semibold">+$5K</p>
          </div>
          <div className="bg-green-100 rounded p-2 text-center">
            <div className="text-xl font-bold">✅</div>
            <p className="text-xs mt-1">Cerrado</p>
            <p className="text-xs text-green-600 font-semibold">+$7K</p>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="font-semibold text-green-900">Valor total en pipeline:</p>
          <p className="text-sm text-green-800">$15,600 en 8 oportunidades activas</p>
        </div>
      </div>
    ),
  },
  {
    title: "Resultados Garantizados - Mes 1",
    subtitle: "Después de 30 días trabajando 20 minutos",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
            <div className="text-3xl font-bold text-[var(--brand-blue)]">+200</div>
            <p className="text-sm text-[var(--muted)] mt-1">Nuevos Seguidores</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
            <div className="text-3xl font-bold text-[var(--brand-blue)]">18-20</div>
            <p className="text-sm text-[var(--muted)] mt-1">Leads Calificados</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200">
            <div className="text-3xl font-bold text-green-700">5-7</div>
            <p className="text-sm text-[var(--muted)] mt-1">Clientes Cerrados</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200">
            <div className="text-3xl font-bold text-green-700">$5,000+</div>
            <p className="text-sm text-[var(--muted)] mt-1">Ingresos Generados</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="font-semibold text-yellow-900">🎁 Bonificación:</p>
          <p className="text-sm text-yellow-800 mt-1">
            <strong>Tú cobras: $3,500+</strong> (70% del revenue)
          </p>
          <p className="text-sm text-yellow-800">
            EVOLUSA se queda con 30% (mantener la plataforma)
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "¿Listo para Empezar?",
    subtitle: "El futuro de tus redes está aquí",
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-navy)] text-white rounded-lg p-4">
          <p className="text-lg font-bold">⏱️ 5 minutos de tu tiempo = $3,500+ en Mes 1</p>
          <p className="text-sm mt-2 opacity-90">Conecta Instagram → El sistema hace el resto</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-[var(--brand-blue)]">1</div>
            <p className="text-xs font-semibold mt-1">Conecta</p>
            <p className="text-xs text-[var(--muted)]">Tu Instagram</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-[var(--brand-blue)]">2</div>
            <p className="text-xs font-semibold mt-1">Configura</p>
            <p className="text-xs text-[var(--muted)]">Tu nicho</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-[var(--brand-blue)]">3</div>
            <p className="text-xs font-semibold mt-1">Espera</p>
            <p className="text-xs text-[var(--muted)]">30 días</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-700">🎉</div>
            <p className="text-xs font-semibold mt-1">Cobra</p>
            <p className="text-xs text-green-600">$3,500+</p>
          </div>
        </div>

        <p className="text-center text-lg font-semibold text-[var(--brand-blue)]">
          El tiempo de las redes manuales se acabó.
        </p>
        <p className="text-center text-sm text-[var(--muted)]">
          Bienvenida al futuro. 🚀
        </p>
      </div>
    ),
  },
];

export default function GrowthAutomationDemoPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tu Sistema"
        title="Growth Automation 1MIGRATION"
        description="Cómo automatizar crecimiento + leads + cerrar deals"
      />

      {/* Progress Bar */}
      <div className="h-1 bg-[var(--sky-surface)] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-navy)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-8 min-h-[500px] flex flex-col">
        <div className="flex-1">
          <p className="text-xs font-semibold text-[var(--muted)] uppercase mb-2">
            Paso {currentSlide + 1} de {slides.length}
          </p>
          <h2 className="text-3xl font-bold text-[var(--brand-navy)] mb-2">
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="text-lg text-[var(--muted)] mb-8">{slide.subtitle}</p>
          )}
          <div className="space-y-6">{slide.content}</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={prevSlide}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-[var(--brand-navy)] rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft size={20} />
          Anterior
        </button>

        <div className="flex-1 flex justify-center gap-1">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-[var(--brand-blue)] w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--brand-blue)] text-white rounded-lg font-semibold hover:bg-[var(--brand-navy)] transition-colors"
        >
          Siguiente
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Keyboard Navigation Hint */}
      <p className="text-xs text-[var(--muted)] text-center">
        💡 Usa las flechas del teclado o los botones para navegar
      </p>
    </div>
  );
}
