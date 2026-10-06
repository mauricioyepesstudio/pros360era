import { createSupabaseServerClient } from '@/lib/supabase/server';
import { parseProfessionalDraft, professionalDraftVersion, type ProfessionalDraft } from './validation';

// Private onboarding answers, versioned independently from the member roadmap.
// Never promotes an account or links someone else's public application by email.
export async function getMyProfessionalDraft(): Promise<ProfessionalDraft | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('onboarding_responses').select('answers')
    .eq('user_id', user.id).eq('roadmap_version', professionalDraftVersion)
    .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(1).maybeSingle();
  return parseProfessionalDraft(data?.answers);
}
export async function saveMyProfessionalDraft(input: unknown) {
  const draft = parseProfessionalDraft(input);
  if (!draft) return { saved: false, message: 'Revisa el nombre, la categoría, la longitud de los textos y los enlaces (http o https).' };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { saved: false, message: 'El servicio de cuentas no está disponible.' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { saved: false, message: 'Inicia sesión para guardar tu perfil.' };
  const { error } = await supabase.from('onboarding_responses').insert({
    user_id: user.id, answers: draft, selected_needs: [], roadmap_version: professionalDraftVersion,
  });
  return error ? { saved: false, message: 'No pudimos guardar. Tu texto sigue en el formulario; inténtalo de nuevo.' }
    : { saved: true, message: 'Borrador privado guardado en tu cuenta.' };
}
