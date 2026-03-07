import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { predictHangover } from '../utils/hangover'
import {
  BarChart3, Calendar, TrendingUp, Wine, Clock, ChevronRight,
  Download, Trophy, Flame, Target, Activity
} from 'lucide-react'

const drinkColors = { shot: '#f59e0b', beer: '#f97316', mixed: '#3b82f6' }

function StatCard({ icon: Icon, value, label, color, bg }) {
  return (
    <div className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
        <Icon size={18} style={{ color }} />
      </div>
      <p className="text-2xl font-black" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="flex-1 h-full rounded-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
      <div
        className="h-full rounded-sm"
        style={{
          width: `${pct}%`,
          backgroundColor: color,
          opacity: 0.85,
          transition: 'width 0.6s ease',
        }}
      />
    </div>
  )
}

export default function History() {
  const { profile } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | month | week

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('drink_sessions')
        .select('*, drink_logs(*)')
        .eq('user_id', profile?.id || '')
        .eq('is_active', false)
        .order('started_at', { ascending: false })
        .limit(50)
      setSessions(data || [])
      setLoading(false)
    }
    if (profile?.id) load()
  }, [profile])

  const now = new Date()
  const filtered = sessions.filter((s) => {
    if (filter === 'week') {
      const d = new Date(s.started_at)
      return (now - d) / 86400000 <= 7
    }
    if (filter === 'month') {
      const d = new Date(s.started_at)
      return (now - d) / 86400000 <= 30
    }
    return true
  })

  const totalSessions = filtered.length
  const totalDrinks = filtered.reduce((a, s) => a + (s.total_standard_drinks || 0), 0)
  const avgDrinks = totalSessions > 0 ? (totalDrinks / totalSessions).toFixed(1) : '—'
  const peakBAC = filtered.reduce((a, s) => Math.max(a, s.peak_bac || 0), 0)
  const underLimitCount = filtered.filter(
    (s) => (s.total_standard_drinks || 0) <= (profile?.calculated_high_limit || 99)
  ).length
  const streakDays = (() => {
    // count consecutive weeks with at least one under-limit session
    if (filtered.length === 0) return 0
    let streak = 0
    const underDates = filtered
      .filter((s) => (s.total_standard_drinks || 0) <= (profile?.calculated_high_limit || 99))
      .map((s) => new Date(s.started_at))
    underDates.sort((a, b) => b - a)
    for (let i = 0; i < underDates.length; i++) {
      if (i === 0) { streak = 1; continue }
      const diff = (underDates[i - 1] - underDates[i]) / 86400000
      if (diff <= 10) streak++
      else break
    }
    return streak
  })()

  // For bar chart: last 8 sessions reversed
  const chartSessions = [...filtered].slice(0, 8).reverse()
  const maxDrinksInChart = Math.max(...chartSessions.map((s) => s.total_standard_drinks || 0), 1)

  function exportCSV() {
    const rows = [
      ['Date', 'Duration (hrs)', 'Drinks', 'Peak BAC', 'Shots', 'Beers', 'Mixed', 'Hangover'],
    ]
    filtered.forEach((s) => {
      const start = new Date(s.started_at)
      const end = s.ended_at ? new Date(s.ended_at) : new Date()
      const hours = ((end - start) / 3600000).toFixed(1)
      const logs = s.drink_logs || []
      const shots = logs.filter((l) => l.drink_type === 'shot').length
      const beers = logs.filter((l) => l.drink_type === 'beer').length
      const mixed = logs.filter((l) => l.drink_type === 'mixed').length
      const hangover = profile
        ? predictHangover(s.total_standard_drinks || 0, profile.weight_lbs, profile.biological_gender, parseFloat(hours)).severity
        : '—'
      rows.push([
        start.toLocaleDateString(),
        hours,
        s.total_standard_drinks || 0,
        (s.peak_bac || 0).toFixed(3),
        shots, beers, mixed, hangover,
      ])
    })
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tipsy-history-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text)', letterSpacing: '-0.03em' }}>History</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{totalSessions} sessions recorded</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-5"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {[['all', 'All Time'], ['month', '30 Days'], ['week', '7 Days']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={
                filter === v
                  ? { background: '#f59e0b', color: '#09090b' }
                  : { color: 'var(--text-muted)', backgroundColor: 'transparent' }
              }
            >
              {l}
            </button>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard icon={Wine} value={totalDrinks.toFixed(1)} label="Total Drinks" color="#f59e0b" bg="rgba(245,158,11,0.1)" />
          <StatCard icon={BarChart3} value={avgDrinks} label="Avg / Night" color="#3b82f6" bg="rgba(59,130,246,0.1)" />
          <StatCard icon={TrendingUp} value={peakBAC.toFixed(3)} label="Peak BAC Ever" color="#ef4444" bg="rgba(239,68,68,0.1)" />
          <StatCard icon={Flame} value={streakDays} label="Limit Streak" color="#10b981" bg="rgba(16,185,129,0.1)" />
        </div>

        {/* Under-limit progress */}
        {totalSessions > 0 && (
          <div
            className="rounded-2xl border p-5 mb-5"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target size={14} style={{ color: '#10b981' }} />
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Within Limit
                </p>
              </div>
              <span className="font-black text-sm" style={{ color: '#10b981' }}>
                {underLimitCount}/{totalSessions}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(underLimitCount / totalSessions) * 100}%`,
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px rgba(16,185,129,0.4)',
                  transition: 'width 0.8s ease',
                }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              {Math.round((underLimitCount / totalSessions) * 100)}% of nights you stayed within your high limit
            </p>
          </div>
        )}

        {/* Bar chart - last 8 sessions */}
        {chartSessions.length > 1 && (
          <div
            className="rounded-2xl border p-5 mb-5"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Recent Nights
              </p>
            </div>
            <div className="flex items-end gap-1.5 h-24">
              {chartSessions.map((s, i) => {
                const drinks = s.total_standard_drinks || 0
                const overLimit = drinks > (profile?.calculated_high_limit || 99)
                const color = overLimit ? '#ef4444' : drinks > (profile?.calculated_med_limit || 99) ? '#f97316' : '#10b981'
                const pct = maxDrinksInChart > 0 ? Math.max((drinks / maxDrinksInChart) * 100, 4) : 4
                return (
                  <Link
                    to={`/session/${s.id}`}
                    key={s.id}
                    className="flex-1 flex flex-col items-center gap-1"
                    title={`${drinks} drinks — ${new Date(s.started_at).toLocaleDateString()}`}
                  >
                    <span className="text-xs font-bold" style={{ color }}>{drinks}</span>
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${pct}%`,
                        minHeight: '4px',
                        backgroundColor: color,
                        opacity: 0.85,
                      }}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>
                      {new Date(s.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </Link>
                )
              })}
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              {[['#10b981', 'Under limit'], ['#f97316', 'Med zone'], ['#ef4444', 'Over limit']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                  {l}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session list */}
        <div
          className="rounded-2xl border overflow-hidden mb-5"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                All Sessions
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Wine size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>No sessions yet</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Track a night to see your history here.</p>
            </div>
          ) : (
            <div>
              {filtered.map((s) => {
                const start = new Date(s.started_at)
                const end = s.ended_at ? new Date(s.ended_at) : new Date()
                const hours = ((end - start) / 3600000).toFixed(1)
                const drinks = s.total_standard_drinks || 0
                const overLimit = drinks > (profile?.calculated_high_limit || 99)
                const statusColor = overLimit ? '#ef4444' : '#10b981'
                const logs = s.drink_logs || []
                const breakdown = logs.reduce((acc, l) => {
                  acc[l.drink_type] = (acc[l.drink_type] || 0) + 1; return acc
                }, {})

                return (
                  <Link
                    to={`/session/${s.id}`}
                    key={s.id}
                    className="flex items-center justify-between px-4 py-3.5 border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                          {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: statusColor, flexShrink: 0 }}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>{drinks} drinks</span>
                        <span>·</span>
                        <span>BAC {(s.peak_bac || 0).toFixed(3)}</span>
                        <span>·</span>
                        <span>{hours}h</span>
                      </div>
                      {Object.keys(breakdown).length > 0 && (
                        <div className="flex gap-2 mt-1.5">
                          {Object.entries(breakdown).map(([type, count]) => (
                            <div
                              key={type}
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-semibold"
                              style={{ backgroundColor: `${drinkColors[type] || '#f59e0b'}15`, color: drinkColors[type] || '#f59e0b' }}
                            >
                              {count} {type}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }} />
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Trophy */}
        {underLimitCount === totalSessions && totalSessions >= 3 && (
          <div
            className="rounded-2xl p-4 text-center mb-4"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <Trophy size={20} style={{ color: '#f59e0b', margin: '0 auto 6px' }} />
            <p className="font-bold text-sm" style={{ color: '#f59e0b' }}>Perfect record!</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              You've stayed within your limit every single night. Keep it up!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
