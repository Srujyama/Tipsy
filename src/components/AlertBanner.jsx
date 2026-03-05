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
    danger: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', darkBg: '#450a0a33', darkBorder: '#7f1d1d', darkText: '#fca5a5' },
    warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', darkBg: '#451a0333', darkBorder: '#78350f', darkText: '#fcd34d' },
    info: { bg: '#f0fdf4', border: '#86efac', text: '#166534', darkBg: '#052e1633', darkBorder: '#14532d', darkText: '#86efac' },
  }

  const s = styles[severity]

  return (
    <div
      className="rounded-xl border p-4 flex items-start gap-3 transition-colors"
      style={{ backgroundColor: s.bg, borderColor: s.border, color: s.text }}
    >
      {severity === 'danger' ? (
        <XCircle size={20} className="shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
      )}
      <div>
        <p className="text-sm font-semibold">{message}</p>
        <p className="text-xs opacity-75 mt-1">Drink responsibly. Stay hydrated.</p>
      </div>
    </div>
  )
}
