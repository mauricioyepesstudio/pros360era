import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import Card from "@/components/ui/Card";

export default function OpportunityStartResult({
  kind,
  message,
  onRetry,
}: {
  kind: "error" | "no-match" | "done";
  message?: string;
  onRetry?: () => void;
}) {
  if (kind === "error") {
    return (
      <Card className="max-w-xl" role="alert" aria-live="assertive">
        <p className="font-bold text-[var(--brand-navy)]">{message}</p>
        <Button type="button" className="mt-5" onClick={onRetry}>
          Intentar de nuevo
        </Button>
      </Card>
    );
  }

  const noMatch = kind === "no-match";
  return (
    <Card className="max-w-xl text-center" aria-live="polite">
      <p className="text-lg font-bold text-[var(--brand-navy)]">
        {noMatch ? "Todavía no tenemos una opción compatible para esta necesidad." : "Encontramos una opción compatible."}
      </p>
      <p className="mt-2 leading-6 text-[var(--muted)]">
        {noMatch
          ? "Guardamos tu solicitud. La red de profesionales de EVOLUSA sigue creciendo — vuelve a intentarlo más adelante."
          : "Compartiste únicamente la información que autorizaste. Ahora estamos esperando que el profesional inicie el contacto."}
      </p>
      <ButtonLink href="/conexiones" className="mt-5">
        {noMatch ? "Volver a mis conexiones" : "Ver mis conexiones"}
      </ButtonLink>
    </Card>
  );
}
