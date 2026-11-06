"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAuthReadiness } from "@/lib/auth/config";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (!getAuthReadiness().configured) return;
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({data})=>setReady(Boolean(data.session)));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==="PASSWORD_RECOVERY" || session) setReady(true);
    });
    return ()=>subscription.unsubscribe();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if(password.length<8 || password!==confirm){setMessage("Usa al menos 8 caracteres y confirma la misma contraseña.");return;}
    setPending(true);setMessage("");
    try {
      const {error}=await createSupabaseBrowserClient().auth.updateUser({password});
      if(error) throw error;
      setSuccess(true);setMessage("Contraseña actualizada correctamente.");
      await createSupabaseBrowserClient().auth.signOut();
    } catch {setMessage("No se pudo cambiar la contraseña. Solicita un nuevo enlace.");}
    finally {setPending(false);}
  }
  return <main className="min-h-screen bg-[var(--warm-canvas)] px-5 py-16">
    <div className="mx-auto max-w-md rounded-3xl border border-[var(--border)] bg-white p-8 shadow-lg">
      <h1 className="text-3xl font-extrabold text-[var(--brand-navy)]">Nueva contraseña</h1>
      {message && <p role="status" className="mt-5">{message}</p>}
      {success ? <Link href="/login" className="mt-6 inline-block font-bold text-[var(--brand-blue)] underline">Iniciar sesión</Link> :
      ready ? <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">Nueva contraseña<input required type="password" autoComplete="new-password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border p-3" /></label>
        <label className="block text-sm font-semibold">Confirmar contraseña<input required type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border p-3" /></label>
        <button disabled={pending} className="min-h-12 w-full rounded-full bg-[var(--brand-coral)] font-bold text-white disabled:opacity-50">{pending?"Guardando…":"Guardar contraseña"}</button>
      </form> : <p className="mt-5">Abre esta página desde el enlace recibido por correo. Si el enlace expiró, <Link href="/forgot-password" className="font-bold underline">solicita uno nuevo</Link>.</p>}
    </div>
  </main>;
}
