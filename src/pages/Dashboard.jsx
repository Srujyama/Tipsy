import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useDrinkSession } from '../hooks/useDrinkSession'
import { Wine, BarChart3, Users, Trophy, Moon, Sun, ChevronRight, Activity } from 'lucide-react'

function getGreeting(name) {
  const h = new Date().getHours()
  const word = h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'
  return { word, name: name?.split(' ')[0] || 'there' }
}

const tiles = [
  { id: 'start', icon: Wine, label: 'Track Tonight', sub: 'Log drinks & BAC', accent: '#f59e0b' },
  { id: 'stats', icon: BarChart3, label: 'My Stats', sub: 'Sessions & history', accent: '#60a5fa', route: '/profile' },
  { id: 'friends', icon: Users, label: 'Friends', sub: 'Social & alerts', accent: '#a78bfa', route: '/social' },
  { id: 'board', icon: Trophy, label: 'Leaderboard', sub: 'Uni rankings', accent: '#22c55e', route: '/leaderboard' },
]

export default function Dashboard() {
  const { profile } = useAuth()
  const { dark, toggle } = useTheme()
  const { activeSession, totalDrinks, startSession, loading } = useDrinkSession()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: '#f59e0b', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const greeting = getGreeting(profile?.display_name)
  const limits = {
    low: profile?.calculated_low_limit || 0,
    med: profile?.calculated_med_limit || 0,
    high: profile?.calculated_high_limit || 0,
  }

  async function handleTile(tile) {
    if (tile.id === 'start') {
      if (activeSession) { navigate('/track'); return }
      const { error } = await startSession()
      if (!error) navigate('/track')
    } else {
      navigate(tile.route)
    }
  }

  return (
    <div className="min-h-screen pb-28 page-enter" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
              {greeting.word}
            </p>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>
              {greeting.name}
            </h1>
          </div>
          <button
            onClick={toggle}
            className="p-2 rounded-xl border mt-1"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Active session banner */}
        {activeSession && (
          <button
            onClick={() => navigate('/track')}
            className="w-full mb-6 px-4 py-3 rounded-2xl flex items-center justify-between"
            style={{ background: 'var(--accent-dim)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#f59e0b' }} />
              <div className="text-left">
                <p className="font-semibold text-sm" style={{ color: '#f59e0b' }}>Session active</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{totalDrinks} drink{totalDrinks !== 1 ? 's' : ''} · tap to continue</p>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: '#f59e0b' }} />
          </button>
        )}

        {/* Tiles */}
        <div className="grid grid-cols-2 gap-2.5 mb-7">
          {tiles.map((tile) => {
            const Icon = tile.icon
            const isStart = tile.id === 'start'
            const label = isStart && activeSession ? 'Continue Night' : tile.label
            return (
              <button
                key={tile.id}
                onClick={() => handleTile(tile)}
                className="relative text-left rounded-2xl p-4 overflow-hidden"
                style={{
                  backgroundColor: isStart ? tile.accent : 'var(--bg-card)',
                  border: isStart ? 'none' : '1px solid var(--border)',
                  minHeight: '118px',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: isStart ? 'rgba(0,0,0,0.15)' : `${tile.accent}14` }}
                >
                  <Icon size={18} style={{ color: isStart ? '#09090b' : tile.accent }} strokeWidth={1.8} />
                </div>
                <p className="font-bold text-sm leading-tight" style={{ color: isStart ? '#09090b' : 'var(--text)', letterSpacing: '-0.01em' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: isStart ? 'rgba(9,9,11,0.6)' : 'var(--text-muted)' }}>{tile.sub}</p>
              </button>
            )
          })}
        </div>

        {/* Limits card */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Your Limits
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Low', val: limits.low, color: '#22c55e' },
              { label: 'Med', val: limits.med, color: '#f59e0b' },
              { label: 'High', val: limits.high, color: '#f43f5e' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <div
                  className="w-full py-3 rounded-xl mb-1.5 font-black text-2xl"
                  style={{ background: `${color}10`, color, letterSpacing: '-0.02em' }}
                >
                  {val || '—'}
                </div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>

          {profile && profile.calibration_count < 3 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Calibration — limits sharpen over 3 nights
                </p>
                <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>
                  {profile.calibration_count}/3
                </span>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full"
                    style={{ backgroundColor: i < profile.calibration_count ? '#f59e0b' : 'var(--border)' }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs pb-2" style={{ color: 'var(--text-muted)' }}>
          Never drink and drive
        </p>
      </div>
    </div>
  )
}
