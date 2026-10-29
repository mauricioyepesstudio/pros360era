type Status = "new" | "contacted" | "qualified" | "unqualified" | "converted" | "lost";
const actions: Record<Status, {title: string; draft: string}> = {
 new: {title: "Preparar primera respuesta", draft: "Hola. Gracias por escribir. ¿Qué servicio necesitas y para qué fecha?"},
 contacted: {title: "Confirmar siguiente paso", draft: "Confirmar la necesidad del cliente y si desea continuar con una propuesta."},
 qualified: {title: "Preparar propuesta", draft: "Preparar entregables, fechas y precio para revision antes de compartir."},
 unqualified: {title: "Revisar cierre", draft: "Revisar el motivo del cierre y conservar solo la informacion necesaria."},
 converted: {title: "Preparar inicio del servicio", draft: "Confirmar entregables, responsable y proxima fecha acordada."},
 lost: {title: "Registrar motivo y cerrar", draft: "Registrar el motivo del cierre. No reactivar ni contactar sin autorizacion aplicable."}
};
export function leadNextAction(lead: {status: string; updated_at: string}) {
 if (!Object.hasOwn(actions, lead.status) || !Number.isFinite(Date.parse(lead.updated_at))) return null;
 return {...actions[lead.status as Status], key: "followup-v1:" + lead.status};
}
export function appendActionOnce(notes: string, action: {key: string; draft: string}) {
 const marker = "[Accion " + action.key + "]";
 if (notes.includes(marker)) return notes;
 const next = (notes.trim() ? notes.trim() + "\n\n" : "") + marker + "\nBorrador para revisar: " + action.draft;
 return next.length <= 2000 ? next : null;
}
