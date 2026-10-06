'use client';
import { useState, type FormEvent } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import { applicationCategoryOptions } from '@/data/professional-applications/categories';
import type { ProfessionalDraft } from '@/lib/professional-drafts/validation';
import { saveProfessionalDraftAction } from '@/app/(account)/dashboard/professional/actions';

export default function ProfessionalDraftForm({ initial }: { initial: ProfessionalDraft | null }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ saved: boolean; message: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true); setResult(null);
    try { setResult(await saveProfessionalDraftAction(Object.fromEntries(form.entries()))); }
    catch { setResult({ saved: false, message: 'No pudimos guardar. Conserva esta página abierta e inténtalo de nuevo.' }); }
    finally { setPending(false); }
  }
  return <section className="rounded-xl border border-[var(--border)] bg-white p-6">
    <h2 className="text-xl font-bold">Completa tu perfil privado</h2>
    <p className="mt-3 text-sm text-[var(--muted)]">Puedes preparar y guardar tu presentación desde ahora. Este borrador no se publica ni sustituye la solicitud de revisión.</p>
    <form onSubmit={submit} className="mt-5 space-y-4">
      <label className="block text-sm font-semibold">Nombre o negocio<Input name="displayName" required maxLength={200} defaultValue={initial?.displayName ?? ''}/></label>
      <label className="block text-sm font-semibold">Área de servicio<Select name="category" defaultValue={initial?.category ?? applicationCategoryOptions[0].id}>{applicationCategoryOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</Select></label>
      <label className="block text-sm font-semibold">Ciudad<Input name="city" maxLength={100} defaultValue={initial?.city ?? ''}/></label>
      <label className="block text-sm font-semibold">Tu pitch en una frase<Input name="headline" maxLength={200} defaultValue={initial?.headline ?? ''} placeholder="Ayudo a negocios locales a mejorar su presencia digital."/></label>
      <label className="block text-sm font-semibold">Experiencia y servicios<Textarea name="bio" maxLength={1200} defaultValue={initial?.bio ?? ''}/></label>
      {(['instagram', 'facebook', 'website'] as const).map(key => <label key={key} className="block text-sm font-semibold">{key === 'website' ? 'Sitio web / portafolio' : key === 'instagram' ? 'Instagram' : 'Facebook'}<Input name={key} type="url" maxLength={500} defaultValue={initial?.[key] ?? ''} placeholder="https://…"/></label>)}
      <p className="text-sm text-[var(--muted)]">Estos enlaces presentan tu trabajo. No conceden acceso a tus cuentas ni permiso para publicar. La autorización de redes se solicitará por separado cuando la integración esté disponible.</p>
      {result && <p role={result.saved ? 'status' : 'alert'} className={result.saved ? 'text-[var(--brand-blue)]' : 'text-[var(--danger)]'}>{result.message}</p>}
      <Button type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar mi perfil privado'}</Button>
    </form>
  </section>;
}
