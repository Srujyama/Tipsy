import { useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDrinkSession } from '../hooks/useDrinkSession'
import { DRINK_TYPES } from '../utils/bac'
import BACMeter from '../components/BACMeter'
import AlertBanner from '../components/AlertBanner'
import toast from 'react-hot-toast'
import { Wine, Beer, GlassWater } from 'lucide-react'

const tips = [
  'Alternate alcoholic drinks with water.',
  'Eat before and during drinking.',
  'Know your limits and stick to them.',
  'Never leave your drink unattended.',
  'Plan your ride home before you go out.',
  "It's always okay to say no to another drink.",
]

const drinkStyles = {
  shot: {
    gradient: 'linear-gradient(135deg, #f5c842 0%, #e8a020 100%)',
    glow: 'rgba(245,200,66,0.35)',
    icon: Wine,
    textColor: '#0a0c14',
    logColor: '#f5c842',
    borderColor: 'rgba(245,200,66,0.4)',
  },
  beer: {
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea6020 100%)',
    glow: 'rgba(249,115,22,0.35)',
    icon: Beer,
    textColor: '#ffffff',
    logColor: '#f97316',
    borderColor: 'rgba(249,115,22,0.4)',
  },
  mixed: {
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    glow: 'rgba(59,130,246,0.35)',
    icon: GlassWater,
    textColor: '#ffffff',
    logColor: '#3b82f6',
    borderColor: 'rgba(59,130,246,0.4)',
  },
}

export default function DrinkTracker() {
  const { profile } = useAuth()
  const {
    activeSession,
    drinkLogs,
    currentBAC,
    totalDrinks,
    loading,
    logDrink,
    endSession,
  } = useDrinkSession()
  const navigate = useNavigate()
  const ending = useRef(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent" style={{ borderColor: '#f5c842', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!activeSession && !ending.current) return <Navigate to="/dashboard" replace />

  const limits = {
    low: profile?.calculated_low_limit || 0,
    med: profile?.calculated_med_limit || 0,
    high: profile?.calculated_high_limit || 0,
  }

  const personalLimit = profile?.personal_drink_limit
  const effectiveLimit = personalLimit || limits.high
  const progress = effectiveLimit > 0 ? Math.min(totalDrinks / effectiveLimit, 1) : 0
  const progressColor = progress >= 1 ? '#ef4444' : progress >= 0.7 ? '#f97316' : '#10b981'
  const tip = tips[Math.floor(Date.now() / 60000) % tips.length]

  async function handleLogDrink(type) {
    const { error } = await logDrink(type)
    if (error) {
      toast.error('Failed to log drink')
    } else {
      toast.success(`+1 ${DRINK_TYPES[type].label}`, { icon: '🥃' })
    }
  }

  async function handleEndNight() {
    ending.current = true
    const { sessionId, error } = await endSession()
    if (error) {
      ending.current = false
      toast.error('Failed to end session')
    } else {
      if (profile.calibration_count < 3) {
        navigate(`/calibration?session=${sessionId}`)
      } else {
        navigate(`/session/${sessionId}`)
      }
    }
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-xl font-black" style={{ color: 'var(--text)' }}>Tonight's Session</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Started {new Date(activeSession.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* BAC Meter hero card */}
        <div
          className="rounded-3xl border mb-4 pt-6 pb-4 px-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <BACMeter bac={currentBAC} />

          {/* Progress bar inside hero card */}
          <div className="mt-4 px-2">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-bold" style={{ color: 'var(--text)' }}>
                {totalDrinks} drink{totalDrinks !== 1 ? 's' : ''}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {personalLimit ? `Goal: ${personalLimit}` : `Limit: ${effectiveLimit}`}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress * 100}%`,
                  backgroundColor: progressColor,
                  boxShadow: `0 0 8px ${progressColor}80`,
                  transition: 'width 0.5s ease, background-color 0.5s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="mb-4">
          <AlertBanner totalDrinks={totalDrinks} limits={limits} bac={currentBAC} />
        </div>

        {/* Drink Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {Object.entries(DRINK_TYPES).map(([type, info]) => {
            const style = drinkStyles[type] || drinkStyles.shot
            const Icon = style.icon
            return (
              <button
                key={type}
                onClick={() => handleLogDrink(type)}
                className="relative rounded-2xl p-4 text-center overflow-hidden"
                style={{
                  background: style.gradient,
                  boxShadow: `0 6px 20px ${style.glow}`,
                  minHeight: '110px',
                }}
              >
                {/* Decorative bg circle */}
                <div
                  className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  >
                    <Icon size={20} color={style.textColor} />
                  </div>
                  <p className="font-black text-sm" style={{ color: style.textColor }}>
                    {info.label.split(' ')[0]}
                  </p>
                  <p className="text-xs font-medium" style={{ color: style.textColor, opacity: 0.75 }}>
                    {info.standardDrinks} std
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Drink Log */}
        {drinkLogs.length > 0 && (
          <div
            className="rounded-2xl border mb-5 overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Tonight's Log
              </h3>
            </div>
            <div className="divide-y max-h-44 overflow-y-auto" style={{ '--tw-divide-opacity': 1 }}>
              {[...drinkLogs].reverse().map((log) => {
                const s = drinkStyles[log.drink_type] || drinkStyles.shot
                return (
                  <div
                    key={log.id}
                    className="px-4 py-2.5 flex justify-between items-center text-sm"
                    style={{ borderColor: 'var(--border)', borderTopWidth: '1px' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: s.logColor }}
                      />
                      <span className="capitalize font-semibold" style={{ color: 'var(--text)' }}>
                        {log.drink_type}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* End Night */}
        <button
          onClick={handleEndNight}
          className="w-full py-4 rounded-2xl font-bold text-sm mb-4 border-2"
          style={{
            borderColor: currentBAC >= 0.06 ? 'rgba(239,68,68,0.5)' : 'var(--border)',
            color: currentBAC >= 0.06 ? '#ef4444' : 'var(--text-muted)',
            backgroundColor: currentBAC >= 0.06 ? 'rgba(239,68,68,0.05)' : 'transparent',
          }}
        >
          End Night
        </button>

        <p className="text-xs text-center italic pb-2" style={{ color: 'var(--text-muted)' }}>
          💡 {tip}
        </p>
      </div>
    </div>
  )
}
