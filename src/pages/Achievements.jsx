import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Trophy, Flame, Shield, Star, Zap, Heart, Target, Award, Lock } from 'lucide-react'

const ACHIEVEMENTS = [
  {
    id: 'first_night',
    icon: Star,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    title: 'First Night',
    desc: 'Tracked your very first session',
    check: (sessions) => sessions.length >= 1,
  },
  {
    id: 'three_sessions',
    icon: Zap,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    title: 'Getting Started',
    desc: 'Tracked 3 sessions',
    check: (sessions) => sessions.length >= 3,
  },
  {
    id: 'ten_sessions',
    icon: Award,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    title: 'Regular',
    desc: 'Tracked 10 sessions',
    check: (sessions) => sessions.length >= 10,
  },
  {
    id: 'under_limit',
    icon: Shield,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    title: 'Responsible',
    desc: 'Stayed under your limit in a session',
    check: (sessions, profile) => sessions.some(
      (s) => (s.total_standard_drinks || 0) <= (profile?.calculated_high_limit || 99)
    ),
  },
  {
    id: 'three_under',
    icon: Heart,
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.12)',
    title: 'Safe Streak',
    desc: 'Stayed under limit 3 nights in a row',
    check: (sessions, profile) => {
      const sorted = [...sessions].sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
      let streak = 0
      for (const s of sorted) {
        if ((s.total_standard_drinks || 0) <= (profile?.calculated_high_limit || 99)) {
          streak++
          if (streak >= 3) return true
        } else break
      }
      return false
    },
  },
  {
    id: 'five_under',
    icon: Flame,
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    title: 'On Fire',
    desc: 'Stayed under limit 5 nights in a row',
    check: (sessions, profile) => {
      const sorted = [...sessions].sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
      let streak = 0
      for (const s of sorted) {
        if ((s.total_standard_drinks || 0) <= (profile?.calculated_high_limit || 99)) {
          streak++
          if (streak >= 5) return true
        } else break
      }
      return false
    },
  },
  {
    id: 'calibrated',
    icon: Target,
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    title: 'Calibrated',
    desc: 'Completed all 3 calibration sessions',
    check: (sessions, profile) => (profile?.calibration_count || 0) >= 3,
  },
  {
    id: 'perfect_ten',
    icon: Trophy,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.15)',
    title: 'Perfect Ten',
    desc: 'Stayed under limit in 10 sessions',
    check: (sessions, profile) =>
      sessions.filter((s) => (s.total_standard_drinks || 0) <= (profile?.calculated_high_limit || 99)).length >= 10,
  },
]

function AchievementCard({ achievement, unlocked }) {
  const Icon = achievement.icon
  return (
    <div
      className="rounded-2xl border p-4 flex items-center gap-4"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: unlocked ? achievement.color + '40' : 'var(--border)',
        opacity: unlocked ? 1 : 0.6,
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: unlocked ? achievement.bg : 'var(--bg-input)' }}
      >
        {unlocked
          ? <Icon size={22} style={{ color: achievement.color }} />
          : <Lock size={18} style={{ color: 'var(--text-muted)' }} />
        }
      </div>
      <div className="min-w-0">
        <p className="font-bold text-sm" style={{ color: unlocked ? 'var(--text)' : 'var(--text-muted)' }}>
          {achievement.title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{achievement.desc}</p>
      </div>
      {unlocked && (
        <div
          className="ml-auto flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: achievement.bg }}
        >
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: achievement.color }} />
        </div>
      )}
    </div>
  )
}

export default function Achievements() {
  const { profile } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('drink_sessions')
        .select('*')
        .eq('user_id', profile?.id || '')
        .eq('is_active', false)
      setSessions(data || [])
      setLoading(false)
    }
    if (profile?.id) load()
  }, [profile])

  const unlocked = ACHIEVEMENTS.filter((a) => a.check(sessions, profile))
  const locked = ACHIEVEMENTS.filter((a) => !a.check(sessions, profile))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent" style={{ borderColor: '#f59e0b', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>Achievements</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {unlocked.length} / {ACHIEVEMENTS.length} unlocked
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${ACHIEVEMENTS.length > 0 ? (unlocked.length / ACHIEVEMENTS.length) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                boxShadow: '0 0 8px rgba(245,158,11,0.4)',
                transition: 'width 0.8s ease',
              }}
            />
          </div>
        </div>

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#f59e0b' }}>
              Unlocked · {unlocked.length}
            </p>
            <div className="space-y-2.5">
              {unlocked.map((a) => (
                <AchievementCard key={a.id} achievement={a} unlocked={true} />
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              Locked · {locked.length}
            </p>
            <div className="space-y-2.5">
              {locked.map((a) => (
                <AchievementCard key={a.id} achievement={a} unlocked={false} />
              ))}
            </div>
          </div>
        )}

        {unlocked.length === ACHIEVEMENTS.length && (
          <div
            className="rounded-2xl p-5 text-center mt-4"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <Trophy size={24} style={{ color: '#f59e0b', margin: '0 auto 8px' }} />
            <p className="font-black text-base mb-1" style={{ color: '#f59e0b' }}>All achievements unlocked!</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>You're a Tipsy legend. 🏆</p>
          </div>
        )}
      </div>
    </div>
  )
}
