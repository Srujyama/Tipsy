export default function LimitBadge({ level, drinkCount, currentDrinks }) {
  const configs = {
    low: {
      active: 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700',
      inactive: 'border-app',
      text: 'text-buzz-safe',
      label: 'Low',
    },
    med: {
      active: 'bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700',
      inactive: 'border-app',
      text: 'text-buzz-primary',
      label: 'Med',
    },
    high: {
      active: 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700',
      inactive: 'border-app',
      text: 'text-buzz-danger',
      label: 'High',
    },
  }

  const c = configs[level] || configs.low
  const isActive = currentDrinks >= drinkCount

  return (
    <div
      className={`rounded-xl border p-3 text-center transition-colors ${
        isActive ? c.active : ''
      }`}
      style={!isActive ? { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' } : {}}
    >
      <p className={`text-xs uppercase tracking-wide font-semibold ${c.text}`}>{c.label}</p>
      <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>{drinkCount}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>drinks</p>
    </div>
  )
}
