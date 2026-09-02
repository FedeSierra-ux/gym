/**
 * Íconos de la barra inferior, dibujados en SVG.
 *
 * Antes eran emoji (🏠 📋 📅 📈 👤), que el sistema pinta con su propio estilo
 * —brillantes, con relleno y sombra— al lado de una interfaz sobria. Además
 * cambian de forma entre iOS y Android, así que la app se veía distinta en cada
 * teléfono. Estos siguen el trazo de los que ya usaba el detalle de rutina.
 */
export type NavIconName = 'home' | 'rutinas' | 'agenda' | 'progreso' | 'perfil'

const TRAZOS: Record<NavIconName, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  rutinas: 'M8 4h8M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1zM5 4h2v2h10V4h2a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8.5 11h7M8.5 15h5',
  agenda: 'M4 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM8 3v4M16 3v4M4 10h16',
  progreso: 'M4 20V4M4 20h16M7.5 15.5l3.5-4 3 2.5 4.5-6',
  perfil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20.5c.8-3.4 3.6-5.5 7-5.5s6.2 2.1 7 5.5',
}

export function NavIcon({ name, active }: { name: NavIconName; active: boolean }) {
  return (
    <svg
      width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor"
      strokeWidth={active ? 2.1 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
    >
      <path d={TRAZOS[name]} />
      {/* El día de hoy marcado en el calendario, y el punto del último dato */}
      {name === 'agenda' && active && <circle cx="12" cy="14.5" r="1.6" fill="currentColor" stroke="none" />}
      {name === 'progreso' && active && <circle cx="18.5" cy="8" r="1.6" fill="currentColor" stroke="none" />}
    </svg>
  )
}
