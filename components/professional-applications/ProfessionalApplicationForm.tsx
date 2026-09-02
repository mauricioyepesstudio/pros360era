"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { applicationCategoryOptions } from "@/data/professional-applications/categories";
import { submitProfessionalApplicationAction } from "@/app/aplicar-profesional/actions";

export default function ProfessionalApplicationForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [categoryOfInterest, setCategoryOfInterest] = useState(applicationCategoryOptions[0].id);
  const [credentialInfo, setCredentialInfo] = useState("");
  const [bio, setBio] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const selectedCategory = applicationCategoryOptions.find((option) => option.id === categoryOfInterest) ?? applicationCategoryOptions[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setResult(null);
    const response = await submitProfessionalApplicationAction({
      fullName,
      email,
      phone,
      city,
      categoryOfInterest,
      credentialInfo,
      bio,
      notes,
    });
    setPending(false);
    setResult(response.saved ? "success" : "error");
    if (response.saved) {
      setFullName("");
      setEmail("");
      setPhone("");
      setCity("");
      setCredentialInfo("");
      setBio("");
      setNotes("");
    }
  }

  if (result === "success") {
    return (
      <Card className="max-w-xl">
        <h2 className="text-xl font-bold text-[var(--brand-navy)]">¡Recibido!</h2>
        <p className="mt-3 leading-6 text-[var(--muted)]">
          Gracias por tu interés en ser parte de EVOLUSA. Vamos a revisar tu información y te contactamos directamente para los siguientes pasos.
        </p>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <FormField id="full-name" label="Nombre completo" required>
          <Input id="full-name" required maxLength={200} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ej. Marie Fernández" />
        </FormField>

        <FormField id="email" label="Correo electrónico" required hint="El mismo que usarás (o ya usas) para tu cuenta de EVOLUSA.">
          <Input id="email" type="email" required maxLength={200} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tucorreo@ejemplo.com" />
        </FormField>

        <FormField id="phone" label="Teléfono" hint="Opcional.">
          <Input id="phone" type="tel" maxLength={40} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(305) 555-0100" />
        </FormField>

        <FormField id="city" label="Ciudad" hint="Opcional, nos ayuda a ubicarte con clientes cercanos.">
          <Input id="city" maxLength={100} value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ej. Miami" />
        </FormField>

        <FormField id="category" label="¿En qué área quieres participar?" required>
          <Select id="category" required value={categoryOfInterest} onChange={(event) => setCategoryOfInterest(event.target.value)}>
            {applicationCategoryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
                {!option.live ? " (próximamente)" : ""}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="credential" label="Credencial o licencia" hint={selectedCategory.credentialHint}>
          <Input id="credential" maxLength={200} value={credentialInfo} onChange={(event) => setCredentialInfo(event.target.value)} placeholder="Ej. Número de comisión, licencia, o colegiación" />
        </FormField>

        <FormField id="bio" label="Cuéntanos brevemente de ti" hint="Un par de líneas — experiencia, a quién ayudas, qué te distingue.">
          <Textarea id="bio" maxLength={600} value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Ej. Notaria pública en Miami, especializada en documentos de bienes raíces y poderes notariales." />
        </FormField>

        <FormField id="notes" label="¿Algo más que quieras contarnos?" hint="Opcional.">
          <Textarea id="notes" maxLength={600} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </FormField>

        {result === "error" && (
          <p className="text-sm text-[var(--danger)]">No pudimos guardar tu información. Intenta de nuevo en un momento.</p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? "Enviando..." : "Enviar mi información"}
        </Button>
      </form>
    </Card>
  );
}
