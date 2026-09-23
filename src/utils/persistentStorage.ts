/**
 * Almacenamiento persistente.
 *
 * Todo el historial vive en el almacenamiento del navegador. Sin permiso de
 * "persistente", el navegador puede borrarlo solo cuando le falta espacio (o
 * Safari, después de unos días sin abrir el sitio). Con el permiso, sólo se
 * borra si el usuario lo decide. Chrome lo concede sin preguntar a las apps
 * instaladas o usadas seguido; Safari lo concede a las agregadas al inicio.
 */
export type EstadoAlmacenamiento = 'protegido' | 'sin-proteger' | 'no-soportado'

export async function estadoAlmacenamiento(): Promise<EstadoAlmacenamiento> {
  try {
    if (!navigator.storage?.persisted) return 'no-soportado'
    return (await navigator.storage.persisted()) ? 'protegido' : 'sin-proteger'
  } catch {
    return 'no-soportado'
  }
}

/** Pide el permiso si todavía no lo tiene. No molesta: nunca muestra nada si falla. */
export async function pedirAlmacenamientoPersistente(): Promise<EstadoAlmacenamiento> {
  try {
    if (!navigator.storage?.persist) return 'no-soportado'
    if (await navigator.storage.persisted()) return 'protegido'
    return (await navigator.storage.persist()) ? 'protegido' : 'sin-proteger'
  } catch {
    return 'no-soportado'
  }
}
