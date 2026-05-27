export const equipmentIcons: Record<string, string> = {
  barra: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect x="4" y="22" width="40" height="4" rx="2" fill="currentColor" opacity="0.9"/>
    <rect x="2" y="18" width="6" height="12" rx="2" fill="currentColor"/>
    <rect x="8" y="20" width="4" height="8" rx="1.5" fill="currentColor" opacity="0.7"/>
    <rect x="36" y="20" width="4" height="8" rx="1.5" fill="currentColor" opacity="0.7"/>
    <rect x="40" y="18" width="6" height="12" rx="2" fill="currentColor"/>
  </svg>`,

  mancuernas: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect x="2" y="20" width="7" height="8" rx="2" fill="currentColor"/>
    <rect x="9" y="22" width="5" height="4" rx="1" fill="currentColor" opacity="0.7"/>
    <rect x="14" y="21" width="6" height="6" rx="1.5" fill="currentColor"/>
    <rect x="20" y="21" width="8" height="6" rx="2" fill="currentColor" opacity="0.5"/>
    <rect x="28" y="21" width="6" height="6" rx="1.5" fill="currentColor"/>
    <rect x="34" y="22" width="5" height="4" rx="1" fill="currentColor" opacity="0.7"/>
    <rect x="39" y="20" width="7" height="8" rx="2" fill="currentColor"/>
  </svg>`,

  cable: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect x="6" y="4" width="6" height="36" rx="3" fill="currentColor" opacity="0.4"/>
    <rect x="7" y="4" width="4" height="36" rx="2" fill="currentColor" opacity="0.6"/>
    <circle cx="9" cy="8" r="4" fill="currentColor"/>
    <path d="M9 12 C9 12 20 20 30 28 C35 32 38 34 40 36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8"/>
    <circle cx="40" cy="36" r="4" fill="currentColor" opacity="0.9"/>
    <rect x="36" y="33" width="8" height="6" rx="2" fill="currentColor" opacity="0.6"/>
  </svg>`,

  maquina: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect x="4" y="8" width="40" height="32" rx="4" fill="currentColor" opacity="0.15"/>
    <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" stroke-width="2" fill="none"/>
    <rect x="10" y="14" width="8" height="20" rx="2" fill="currentColor" opacity="0.6"/>
    <rect x="20" y="14" width="8" height="20" rx="2" fill="currentColor" opacity="0.4"/>
    <rect x="30" y="14" width="8" height="20" rx="2" fill="currentColor" opacity="0.6"/>
    <circle cx="14" cy="12" r="3" fill="currentColor"/>
    <circle cx="34" cy="12" r="3" fill="currentColor"/>
  </svg>`,

  peso_corporal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="8" r="5" fill="currentColor"/>
    <path d="M24 14 L24 30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M14 19 L24 16 L34 19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M24 30 L16 42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M24 30 L32 42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  kettlebell: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <path d="M24 6 C16 6 10 12 10 20 C10 28 16 36 24 38 C32 36 38 28 38 20 C38 12 32 6 24 6Z" fill="currentColor" opacity="0.85"/>
    <path d="M20 6 C20 4 22 2 24 2 C26 2 28 4 28 6" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>
    <circle cx="24" cy="22" r="6" fill="currentColor" opacity="0.3"/>
  </svg>`,

  banda: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="24" rx="18" ry="8" stroke="currentColor" stroke-width="3" fill="none"/>
    <ellipse cx="24" cy="24" rx="18" ry="8" stroke="currentColor" stroke-width="1" fill="currentColor" opacity="0.1"/>
    <path d="M6 24 C6 16 14 12 24 12 C34 12 42 16 42 24" stroke="currentColor" stroke-width="2.5" fill="none" opacity="0.5"/>
  </svg>`,

  cardio_maquina: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="28" width="32" height="8" rx="4" fill="currentColor" opacity="0.6"/>
    <path d="M12 28 L16 14 L22 22 L26 10 L32 22 L36 28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="12" cy="34" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="36" cy="34" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
  </svg>`,
}

export function getEquipmentIcon(equipmentType: string): string {
  return equipmentIcons[equipmentType] ?? equipmentIcons.peso_corporal
}
