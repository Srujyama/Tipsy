import { Wine, Beer, GlassWater } from 'lucide-react'

const icons = {
  shot: Wine,
  beer: Beer,
  mixed: GlassWater,
}

export default function DrinkCard({ drinkType, label, standardDrinks, onLog, disabled }) {
  const Icon = icons[drinkType] || Wine

  return (
    <button
      onClick={() => onLog(drinkType)}
      disabled={disabled}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none min-h-[100px]"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#f59e0b'
        e.currentTarget.style.backgroundColor = 'var(--bg-input)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.backgroundColor = 'var(--bg-card)'
      }}
    >
      <Icon size={28} className="text-buzz-primary" />
      <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{label}</span>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {standardDrinks} std{standardDrinks !== 1 ? '' : ''}
      </span>
    </button>
  )
}
