const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600']

export default function LeaderboardRow({ rank, name, stat, statLabel, isYou }) {
  const initials = (name || '??')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        isYou ? 'border-buzz-primary bg-buzz-primary/5' : ''
      }`}
      style={!isYou ? { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' } : {}}
    >
      <span className={`text-lg font-bold w-8 text-center ${rank <= 3 ? medalColors[rank - 1] : ''}`}
        style={rank > 3 ? { color: 'var(--text-muted)' } : {}}
      >
        {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : rank}
      </span>
      <div className="w-9 h-9 rounded-full bg-buzz-primary/15 flex items-center justify-center text-buzz-primary font-bold text-xs">
        {initials}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
          {name} {isYou && <span className="text-buzz-primary text-xs font-normal">(you)</span>}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{stat}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{statLabel}</p>
      </div>
    </div>
  )
}
