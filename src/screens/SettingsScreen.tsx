import { useState } from 'react'
import { useStore } from '../store/useStore'

export function SettingsScreen({ onClose }: { onClose: () => void }) {
  const { anthropicApiKey, setAnthropicApiKey, userName, updateUserName } = useStore()
  const [key, setKey] = useState(anthropicApiKey ?? '')
  const [name, setName] = useState(userName)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setAnthropicApiKey(key.trim())
    updateUserName(name.trim() || 'Atleta')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col screen-enter" style={{ background: 'var(--bg)' }}>
      <div className="flex-shrink-0 px-4 pt-12 pb-4 border-b border-border flex items-center gap-3">
        <button onClick={onClose} className="text-gray-400 text-2xl leading-none">‹</button>
        <h1 className="text-lg font-bold text-white">Ajustes</h1>
      </div>

      <div className="flex-1 min-h-0 scroll-area px-4 py-4 flex flex-col gap-5">
        {/* Nombre */}
        <div>
          <p className="section-label mb-2">Tu nombre</p>
          <input
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Tu nombre"
          />
        </div>

        {/* Anthropic API Key */}
        <div>
          <p className="section-label mb-2">API Key de Anthropic</p>
          <p className="text-xs text-gray-500 mb-3">
            Necesaria para las sugerencias de IA personalizadas. Se guarda solo en tu dispositivo.{' '}
            <span className="text-primary">Conseguí tu key en console.anthropic.com</span>
          </p>
          <input
            type="password"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm font-mono"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="sk-ant-..."
          />
          {key && (
            <p className="text-xs text-primary mt-1.5">
              {key.startsWith('sk-ant-') ? '✓ Formato correcto' : '⚠ Debería empezar con sk-ant-'}
            </p>
          )}
        </div>

        {/* Info sobre qué hace la IA */}
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold text-white mb-2">¿Para qué usa la IA?</p>
          <ul className="flex flex-col gap-1.5">
            {[
              'Sugiere cuánto peso subir o bajar basándose en tu historial',
              'Recomienda ejercicios alternativos cuando hacés swap',
              'Analiza tu progreso y da consejos personalizados',
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-400">
                <span className="text-primary flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          {!key && (
            <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-border">
              Sin API key, la app usa sugerencias algorítmicas basadas en tu historial.
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
            saved ? 'bg-primary/20 text-primary border border-primary/30' : 'btn-primary-glow text-black'
          }`}
        >
          {saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
