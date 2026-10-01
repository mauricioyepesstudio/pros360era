"use client";

import { useState } from "react";
import { Sparkles, Calendar, Send } from "lucide-react";
import PageHeader from "@/components/account/PageHeader";

type Platform = "instagram" | "tiktok" | "youtube";

type GeneratedPost = {
  topic?: string;
  caption?: string;
  hashtags?: string[];
};

type GeneratedContent = GeneratedPost & {
  schedule?: GeneratedPost[];
};

export default function ContentPage() {
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [generatingType, setGeneratingType] = useState<"single" | "week" | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  async function handleGenerate(type: "single" | "week") {
    if (!niche) {
      alert("Please enter your niche");
      return;
    }

    setGeneratingType(type);

    try {
      const response = await fetch("/api/growth-automation/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          niche,
          platform,
          tone: "professional",
        }),
      });

      const data = await response.json();
      setGeneratedContent(data);
    } catch (error) {
      alert("Error generating content");
      console.error(error);
    } finally {
      setGeneratingType(null);
    }
  }

  async function schedulePost(content: GeneratedPost, scheduledFor: string) {
    try {
      const response = await fetch("/api/growth-automation/content/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: "placeholder", // TODO: Get from context
          accountId: "placeholder", // TODO: Get from context
          contentText: content.caption,
          scheduledFor,
        }),
      });

      if (response.ok) {
        alert("Post scheduled successfully!");
      } else {
        alert("Failed to schedule post");
      }
    } catch (error) {
      alert("Error scheduling post");
      console.error(error);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Contenido"
        title="Generador IA de Contenido"
        description="Crea contenido optimizado para tus redes sociales automáticamente"
      />

      {/* Input Section */}
      <div className="space-y-4">
        <div className="rounded-lg border border-[var(--border)] bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-[var(--brand-navy)]">
            Configura tu contenido
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--brand-navy)]">
                Tu nicho / profesión
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Ej: Coach de negocios, Diseñadora, Fotógrafo"
                className="mt-2 w-full rounded-lg border border-[var(--border)] px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--brand-navy)]">
                Plataforma
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="mt-2 w-full rounded-lg border border-[var(--border)] px-4 py-2 text-sm"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleGenerate("single")}
                disabled={generatingType !== null}
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-blue)] px-4 py-3 font-semibold text-white hover:bg-[var(--brand-navy)] disabled:opacity-50"
              >
                <Sparkles size={18} />
                {generatingType === "single" ? "Generando..." : "Post único"}
              </button>

              <button
                onClick={() => handleGenerate("week")}
                disabled={generatingType !== null}
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-blue)] px-4 py-3 font-semibold text-white hover:bg-[var(--brand-navy)] disabled:opacity-50"
              >
                <Calendar size={18} />
                {generatingType === "week" ? "Generando..." : "Semana completa"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-green-900">
            ✨ Contenido generado
          </h3>

          {Array.isArray(generatedContent.schedule)
            ? // Week view
              generatedContent.schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="mb-4 rounded-lg bg-white p-4 last:mb-0"
                >
                  <p className="text-sm font-semibold text-[var(--brand-navy)]">
                    {item.topic}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{item.caption}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.hashtags?.slice(0, 5).map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-[var(--brand-blue)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      schedulePost(
                        item,
                        new Date(Date.now() + idx * 24 * 60 * 60 * 1000).toISOString()
                      )
                    }
                    className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--brand-blue)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-navy)]"
                  >
                    <Send size={14} />
                    Agendar
                  </button>
                </div>
              ))
            : // Single post view
              (
                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-[var(--muted)]">
                    {generatedContent.caption}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {generatedContent.hashtags?.slice(0, 10).map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-[var(--brand-blue)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => schedulePost(generatedContent, new Date().toISOString())}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--brand-blue)] px-4 py-2 font-semibold text-white hover:bg-[var(--brand-navy)]"
                  >
                    <Calendar size={16} />
                    Agendar post
                  </button>
                </div>
              )}
        </div>
      )}

      {/* Info */}
      <div className="rounded-lg bg-blue-50 p-6">
        <h3 className="font-semibold text-[var(--brand-navy)]">
          ¿Cómo funciona?
        </h3>
        <ol className="mt-3 space-y-2 text-sm text-[var(--muted)]">
          <li>1. Ingresa tu nicho/profesión</li>
          <li>2. Selecciona la plataforma</li>
          <li>3. Genera contenido automáticamente con IA</li>
          <li>4. Agenda los posts (se publican automáticamente a la hora)</li>
          <li>5. Monitorea engagement en el dashboard</li>
        </ol>
      </div>
    </div>
  );
}
