import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { predictHangover, getHangoverColor } from '../utils/hangover'
import { Clock, Wine, TrendingUp, Droplets, ChevronRight, CheckCircle } from 'lucide-react'

const drinkColors = {
  shot: '#f5c842',
  beer: '#f97316',
  mixed: '#3b82f6',
}

export default function SessionSummary() {
  const { sessionId } = useParams()
  const { profile } = useAuth()
  const [session, setSession] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: sessionData }, { data: logData }] = await Promise.all([
        supabase.from('drink_sessions').select('*').eq('id', sessionId).single(),
        supabase.from('drink_logs').select('*').eq('session_id', sessionId).order('logged_at', { ascending: true }),
      ])
      setSession(sessionData)
      setLogs(logData || [])
      setLoading(false)
    }
    load()
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent" style={{ borderColor: '#f5c842', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="pb-24 px-4 pt-6 max-w-lg mx-auto text-center">
        <p style={{ color: 'var(--text-muted)' }}>Session not found.</p>
        <Link to="/dashboard" className="font-semibold mt-4 inline-block" style={{ color: '#f5c842' }}>Back to Dashboard</Link>
      </div>
    )
  }

  const startTime = new Date(session.started_at)
  const endTime = session.ended_at ? new Date(session.ended_at) : new Date()
  const durationHours = (endTime - startTime) / 3600000
  const totalDrinks = session.total_standard_drinks || 0
  const peakBAC = session.peak_bac || 0
  const breakdown = logs.reduce((acc, log) => {
    acc[log.drink_type] = (acc[log.drink_type] || 0) + 1; return acc
  }, {})

  const hangover = profile
    ? predictHangover(totalDrinks, profile.weight_lbs, profile.biological_gender, durationHours)
    : null

  const highLimit = profile?.calculated_high_limit || 4
  const stayedUnderLimit = totalDrinks <= highLimit

  const stats = [
    { icon: Wine, value: totalDrinks, label: 'Drinks', color: '#f5c842', bg: 'rgba(245,200,66,0.12)' },
    { icon: TrendingUp, value: peakBAC.toFixed(3), label: 'Peak BAC', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    { icon: Clock, value: `${durationHours.toFixed(1)}h`, label: 'Duration', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { icon: Droplets, value: logs.length, label: 'Logged', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  ]

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Hero header */}
        <div
          className="rounded-3xl p-6 mb-5 text-center border"
          style={{
            background: stayedUnderLimit
              ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
              : 'linear-gradient(135deg, rgba(245,200,66,0.12), rgba(245,200,66,0.04))',
            borderColor: stayedUnderLimit ? 'rgba(16,185,129,0.3)' : 'rgba(245,200,66,0.25)',
          }}
        >
          {stayedUnderLimit ? (
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle size={20} style={{ color: '#10b981' }} />
              <span className="font-bold text-sm" style={{ color: '#10b981' }}>Stayed within your limit!</span>
            </div>
          ) : null}
          <h1 className="text-3xl font-black mb-0.5" style={{ color: 'var(--text)' }}>Night Recap</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {startTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>

          {/* Hero BAC */}
          <div className="mt-5">
            <p
              className="text-6xl font-black tabular-nums"
              style={{
                color: peakBAC >= 0.08 ? '#ef4444' : peakBAC >= 0.05 ? '#f97316' : '#f5c842',
                textShadow: `0 0 30px ${peakBAC >= 0.08 ? 'rgba(239,68,68,0.4)' : peakBAC >= 0.05 ? 'rgba(249,115,22,0.4)' : 'rgba(245,200,66,0.4)'}`,
              }}
            >
              {peakBAC.toFixed(3)}
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>
              Peak BAC
            </p>
          </div>
        </div>

        {/* Stats 2×2 grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {stats.map(({ icon: Icon, value, label, color, bg }) => (
            <div
              key={label}
              className="rounded-2xl border p-4"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: bg }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-2xl font-black" style={{ color: 'var(--text)' }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Drink breakdown */}
        {Object.keys(breakdown).length > 0 && (
          <div
            className="rounded-2xl border mb-5 overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Breakdown
              </p>
            </div>
            {Object.entries(breakdown).map(([type, count]) => (
              <div
                key={type}
                className="px-4 py-3 flex justify-between items-center border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: drinkColors[type] || '#f5c842' }} />
                  <span className="capitalize font-semibold text-sm" style={{ color: 'var(--text)' }}>{type}</span>
                </div>
                <span className="font-black text-sm" style={{ color: drinkColors[type] || '#f5c842' }}>{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Morning forecast */}
        {hangover && (
          <div
            className="rounded-2xl border p-5 mb-5"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              Morning Forecast
            </p>
            <p className={`font-bold text-base mb-1 ${getHangoverColor(hangover.severity)}`}>
              {hangover.severity === 'none' ? '✅ Feeling Good' : `⚠️ ${hangover.severity} hangover expected`}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{hangover.message}</p>
          </div>
        )}

        {/* Responsible drinking */}
        <div
          className="rounded-2xl p-4 text-center mb-5"
          style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}
        >
          <p className="font-bold text-sm mb-1" style={{ color: '#f97316' }}>Drink Responsibly</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Hydrate, eat, and never drink and drive. Need help? Call SAMHSA at 1-800-662-4357.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-sm"
          style={{
            background: 'linear-gradient(135deg, #f5c842, #f0a020)',
            color: '#0a0c14',
            boxShadow: '0 6px 20px rgba(245,200,66,0.3)',
          }}
        >
          Back to Dashboard <ChevronRight size={16} />
        </Link>

      </div>
    </div>
  )
}
