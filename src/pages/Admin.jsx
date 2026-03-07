import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Shield, Users, Wine, Trophy, AlertTriangle, Trash2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

// Admin emails — set this to the owner's email(s)
const ADMIN_EMAILS = ['srujantyamali@gmail.com', 'srujanyamali@berkeley.edu']

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ users: 0, sessions: 0, activeSessions: 0 })

  const isAdmin = user && ADMIN_EMAILS.includes(user.email)

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard')
      return
    }
    loadData()
  }, [isAdmin])

  async function loadData() {
    setLoading(true)
    const [usersRes, sessionsRes, activeRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('drink_sessions').select('*, profiles(display_name)').order('started_at', { ascending: false }).limit(50),
      supabase.from('drink_sessions').select('id').eq('is_active', true),
    ])
    setUsers(usersRes.data || [])
    setSessions(sessionsRes.data || [])
    setStats({
      users: usersRes.data?.length || 0,
      sessions: sessionsRes.data?.length || 0,
      activeSessions: activeRes.data?.length || 0,
    })
    setLoading(false)
  }

  async function toggleLeaderboard(userId, current) {
    const { error } = await supabase.from('profiles').update({ show_on_leaderboard: !current }).eq('id', userId)
    if (!error) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, show_on_leaderboard: !current } : u))
      toast.success('Updated')
    }
  }

  if (!isAdmin) return null

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Wine },
    { id: 'stats', label: 'Stats', icon: Trophy },
  ]

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.12)' }}
          >
            <Shield size={20} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <h1 className="text-xl font-black" style={{ color: 'var(--text)' }}>Admin Panel</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Manage users and content</p>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-5"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={tab === id ? { background: '#ef4444', color: '#fff' } : { color: 'var(--text-muted)' }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <>
            {/* Stats tab */}
            {tab === 'stats' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Users', value: stats.users, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
                  { label: 'Total Sessions', value: stats.sessions, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                  { label: 'Active Now', value: stats.activeSessions, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                  { label: 'Avg Sessions/User', value: stats.users > 0 ? (stats.sessions / stats.users).toFixed(1) : '—', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                      <Trophy size={18} style={{ color }} />
                    </div>
                    <p className="text-2xl font-black" style={{ color: 'var(--text)' }}>{value}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Users tab */}
            {tab === 'users' && (
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                {users.length === 0 ? (
                  <p className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No users found</p>
                ) : (
                  users.map((u, i) => (
                    <div
                      key={u.id}
                      className="px-4 py-3 flex items-center justify-between border-t"
                      style={{ borderColor: i === 0 ? 'transparent' : 'var(--border)' }}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{u.display_name || 'No name'}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {u.university_name || 'No university'} · {u.calibration_count || 0}/3 calibrations
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <button
                          onClick={() => toggleLeaderboard(u.id, u.show_on_leaderboard)}
                          className="p-1.5 rounded-lg"
                          style={{
                            color: u.show_on_leaderboard ? '#10b981' : 'var(--text-muted)',
                            background: u.show_on_leaderboard ? 'rgba(16,185,129,0.1)' : 'transparent',
                          }}
                          title={u.show_on_leaderboard ? 'Hide from leaderboard' : 'Show on leaderboard'}
                        >
                          {u.show_on_leaderboard ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sessions tab */}
            {tab === 'sessions' && (
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                {sessions.length === 0 ? (
                  <p className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No sessions found</p>
                ) : (
                  sessions.map((s, i) => (
                    <div
                      key={s.id}
                      className="px-4 py-3 flex items-center justify-between border-t"
                      style={{ borderColor: i === 0 ? 'transparent' : 'var(--border)' }}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>
                          {s.profiles?.display_name || 'Unknown'}
                          {s.is_active && (
                            <span className="ml-2 text-xs font-bold" style={{ color: '#10b981' }}>LIVE</span>
                          )}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(s.started_at).toLocaleDateString()} · {s.total_standard_drinks || 0} drinks · BAC {(s.peak_bac || 0).toFixed(3)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        <div className="mt-4">
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Admin access is restricted to authorized accounts only.
          </p>
        </div>
      </div>
    </div>
  )
}
