import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useDrinkSession } from '../hooks/useDrinkSession'
import { Wine, BarChart3, Users, Trophy, Play, Moon, Sun, ChevronRight, Zap } from 'lucide-react'

function getGreeting(name) {
  const hour = new Date().getHours()
  const emoji = hour < 6 ? '🌙' : hour < 12 ? '☀️' : hour < 17 ? '👋' : hour < 21 ? '🌆' : '🌙'
  const word = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return { word, emoji, name: name || 'there' }
}

const tiles = [
  {
    id: 'start',
    icon: Wine,
    label: 'Start Night',
    sub: 'Track drinks & BAC',
    gradient: 'linear-gradient(135deg, #f5c842 0%, #f0a020 100%)',
    textColor: '#0a0c14',
    route: null, // special handler
    glow: 'rgba(245,200,66,0.3)',
  },
  {
    id: 'stats',
    icon: BarChart3,
    label: 'My Stats',
    sub: 'Sessions & history',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    textColor: '#ffffff',
    route: '/profile',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    id: 'friends',
    icon: Users,
    label: 'Friends',
    sub: 'Social & alerts',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    textColor: '#ffffff',
    route: '/social',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    id: 'board',
    icon: Trophy,
    label: 'Leaderboard',
    sub: 'University rankings',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    textColor: '#ffffff',
    route: '/leaderboard',
    glow: 'rgba(16,185,129,0.3)',
  },
]

export default function Dashboard() {
  const { profile } = useAuth()
  const { dark, toggle } = useTheme()
  const { activeSession, totalDrinks, startSession, loading } = useDrinkSession()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent" style={{ borderColor: '#f5c842', borderTopColor: 'transparent' }} />
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
      if (activeSession) {
        navigate('/track')
        return
      }
      const { error } = await startSession()
      if (!error) navigate('/track')
    } else {
      navigate(tile.route)
    }
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-4 pt-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-2xl" style={{ color: '#f5c842' }}>Buzz</span>
              <span className="font-black text-2xl" style={{ color: 'var(--text)' }}>Board</span>
            </div>
            <p className="font-semibold text-base" style={{ color: 'var(--text)' }}>
              {greeting.word}, {greeting.name} {greeting.emoji}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Drink smart. Stay safe.
            </p>
          </div>
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl border mt-1"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Active Session Banner */}
        {activeSession && (
          <button
            onClick={() => navigate('/track')}
            className="w-full mb-6 p-4 rounded-2xl flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(245,200,66,0.15), rgba(245,200,66,0.05))',
              border: '1px solid rgba(245,200,66,0.3)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f5c842, #f0a020)' }}
              >
                <Zap size={16} fill="#0a0c14" color="#0a0c14" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm" style={{ color: '#f5c842' }}>Night in progress</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{totalDrinks} drink{totalDrinks !== 1 ? 's' : ''} logged · tap to continue</p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: '#f5c842' }} />
          </button>
        )}

        {/* Quick-Launch Tiles */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {tiles.map((tile) => {
            const Icon = tile.icon
            const isStart = tile.id === 'start'
            const label = isStart && activeSession ? 'Continue Night' : tile.label

            return (
              <button
                key={tile.id}
                onClick={() => handleTile(tile)}
                className="relative rounded-2xl p-5 text-left overflow-hidden"
                style={{
                  background: tile.gradient,
                  boxShadow: `0 8px 24px ${tile.glow}`,
                  minHeight: '130px',
                }}
              >
                {/* Decorative circle */}
                <div
                  className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                />
                <div
                  className="absolute -right-1 -top-6 w-14 h-14 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />

                <div className="relative z-10 flex flex-col h-full">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  >
                    <Icon size={20} color={tile.textColor} strokeWidth={2} />
                  </div>
                  <p className="font-black text-sm leading-tight" style={{ color: tile.textColor }}>{label}</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: tile.textColor, opacity: 0.7 }}>{tile.sub}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Your Limits */}
        <div
          className="rounded-2xl border p-5 mb-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
            Your Limits
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'LOW', val: limits.low, color: '#10b981' },
              { label: 'MED', val: limits.med, color: '#f5c842' },
              { label: 'HIGH', val: limits.high, color: '#ef4444' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <div
                  className="w-full py-3 rounded-xl mb-1.5 font-black text-2xl"
                  style={{ background: `${color}15`, color }}
                >
                  {val || '—'}
                </div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Calibration progress */}
          {profile && profile.calibration_count < 3 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Calibration — limits improve each session
                </p>
                <span className="text-xs font-bold" style={{ color: '#f5c842' }}>
                  {profile.calibration_count}/3
                </span>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full"
                    style={{
                      backgroundColor: i < profile.calibration_count ? '#f5c842' : 'var(--border)',
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          🛡️ Never drink and drive
        </p>

      </div>
    </div>
  )
}
