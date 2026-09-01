import { CheckCircle2, Circle } from "lucide-react";
import type { CreditPlanStep } from "@/data/plans/credit-plan";
import { completeRoadmapItemAction } from "@/app/(account)/actions";

function Step({ step, index, completed }: { step: CreditPlanStep; index: number; completed: boolean }) {
  return (
    <li className="flex gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4">
      <div className="flex-none pt-0.5">
        {completed ? (
          <CheckCircle2 aria-hidden className="text-[var(--success)]" size={22} />
        ) : (
          <Circle aria-hidden className="text-[var(--muted)]" size={22} />
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)]">Paso {index + 1}</p>
        <h3 className="mt-1 font-bold text-[var(--brand-navy)]">{step.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.description}</p>
        <p className="mt-2 text-xs italic text-slate-500">Por qué en este orden: {step.why}</p>
        {!completed && (
          <form
            action={async () => {
              "use server";
              await completeRoadmapItemAction(step.id);
            }}
            className="mt-3"
          >
            <button type="submit" className="text-xs font-bold text-[var(--brand-blue)] hover:underline">
              Marcar como completado
            </button>
          </form>
        )}
      </div>
    </li>
  );
}

export default function CreditPlanChecklist({ steps, completedIds }: { steps: readonly CreditPlanStep[]; completedIds: readonly string[] }) {
  const completedSet = new Set(completedIds);
  const doneCount = steps.filter((step) => completedSet.has(step.id)).length;
  const progress = Math.round((doneCount / steps.length) * 100);

  return (
    <div>
      <div className="rounded-[var(--radius-lg)] bg-[var(--brand-navy)] p-6 text-white">
        <div className="flex items-center justify-between text-sm">
          <span>Tu progreso</span>
          <strong>
            {doneCount} de {steps.length} pasos
          </strong>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-[var(--brand-coral)]" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <ul className="mt-6 space-y-3">
        {steps.map((step, index) => (
          <Step key={step.id} step={step} index={index} completed={completedSet.has(step.id)} />
        ))}
      </ul>
    </div>
  );
}
