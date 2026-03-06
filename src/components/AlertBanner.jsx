import { AlertTriangle, XCircle } from 'lucide-react'

export default function AlertBanner({ totalDrinks, limits, bac }) {
  if (!limits) return null

  let message = null
  let severity = null

  if (bac >= 0.08) {
    severity = 'danger'
    message = 'You are at the legal limit. Please stop drinking and stay safe.'
  } else if (limits.high > 0 && totalDrinks >= limits.high) {
    severity = 'danger'
    message = "You've reached your high limit. Time to stop and hydrate."
  } else if (limits.med > 0 && totalDrinks >= limits.med) {
    severity = 'warning'
    message = "You've passed your medium limit. Consider slowing down."
  } else if (limits.low > 0 && totalDrinks >= limits.low) {
    severity = 'info'
    message = "You've hit your low limit. Pace yourself and drink water."
  }

  if (!message) return null

  const styles = {
    danger: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', color: '#ef4444' },
    warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b' },
    info: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#10b981' },
  }

  const s = styles[severity]

  return (
    <div
      className="rounded-xl border p-4 flex items-start gap-3"
      style={{ backgroundColor: s.bg, borderColor: s.border, color: s.color }}
    >
      {severity === 'danger' ? (
        <XCircle size={18} className="shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
      )}
      <div>
        <p className="text-sm font-semibold">{message}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Drink responsibly. Stay hydrated.</p>
      </div>
    </div>
  )
}
