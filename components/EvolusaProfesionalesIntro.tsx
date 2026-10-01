"use client";

export default function EvolusaProfesionalesIntro() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-8 rounded-lg mb-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido a EVOLUSA 🚀
        </h2>
        <p className="text-lg text-gray-600">
          Tu CRM + Automatizaciones + Generador de Contenido
        </p>
      </div>

      {/* Explicación */}
      <div className="space-y-4 mb-8">
        <p className="text-gray-700 leading-relaxed">
          <strong>EVOLUSA es tu plataforma todo-en-uno</strong> diseñada especialmente para profesionales como tú.
          Te ayuda a:
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-bold text-gray-900 mb-2">Genera Contenido</h3>
            <p className="text-sm text-gray-600">
              2-3 posts automáticos diarios basados en tus pilares
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-bold text-gray-900 mb-2">Captura Leads</h3>
            <p className="text-sm text-gray-600">
              Clientes potenciales llegan automáticamente a tu CRM
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-bold text-gray-900 mb-2">Gana Dinero</h3>
            <p className="text-sm text-gray-600">
              Tú atiendes, cierras ventas y ganas 70% de cada una
            </p>
          </div>
        </div>
      </div>

      {/* Cómo funciona */}
      <div className="bg-white p-6 rounded-lg border border-blue-300">
        <h3 className="text-xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              1
            </div>
            <div>
              <p className="font-semibold text-gray-900">Sube tu calendario de contenido</p>
              <p className="text-sm text-gray-600">Con los pilares y temas que quieres cubrir</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              2
            </div>
            <div>
              <p className="font-semibold text-gray-900">Sistema genera posts automáticos</p>
              <p className="text-sm text-gray-600">Optimizados para Instagram, con hashtags y emojis</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              3
            </div>
            <div>
              <p className="font-semibold text-gray-900">Los leads llegan a tu CRM</p>
              <p className="text-sm text-gray-600">Automáticamente desde Instagram, WhatsApp y Email</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">
              4
            </div>
            <div>
              <p className="font-semibold text-gray-900">Tú atiendes y cierras</p>
              <p className="text-sm text-gray-600">Ganas 70% de cada venta. Nosotros nos quedamos con 30%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados esperados */}
      <div className="mt-6 bg-indigo-100 p-4 rounded-lg">
        <h3 className="font-bold text-gray-900 mb-3">En 30 días espera ver:</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">+200</p>
            <p className="text-sm text-gray-600">Nuevos seguidores</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">18-20</p>
            <p className="text-sm text-gray-600">Leads calificados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">$3,500+</p>
            <p className="text-sm text-gray-600">En tu bolsillo (70%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
