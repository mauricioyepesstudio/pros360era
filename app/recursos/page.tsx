import Link from "next/link";
import { southFloridaResources } from "@/data/resources/south-florida";

export const metadata = {
  title: "Recursos en el sur de Florida | EVOLUSA",
  description: "Encuentra apoyo comunitario y fuentes para evaluar servicios profesionales en el sur de Florida.",
};

export default function ResourcesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
      <header className="max-w-2xl space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Recursos en el sur de Florida</h1>
        <p>Elige lo que necesitas resolver y consulta con la organización los requisitos y la disponibilidad.</p>
        <Link className="inline-block font-medium underline underline-offset-4" href="/profesionales">
          Explorar profesionales de EvolUSA
        </Link>
      </header>
      <div className="mt-10 space-y-8">
        {southFloridaResources.map(({ title, entries }) => (
          <section key={title}>
            <h2 className="text-xl font-semibold">{title}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {entries.map(({ name, detail, href }) => (
                <li key={href} className="rounded-lg border p-4">
                  <a className="font-medium underline underline-offset-4" href={href}>{name}</a>
                  <p className="mt-1 text-sm">{detail}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
