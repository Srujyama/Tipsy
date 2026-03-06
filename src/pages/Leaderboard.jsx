import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Trophy, Wine, GraduationCap, Users, Info } from 'lucide-react'

const podiumColors = ['#f5c842', '#94a3b8', '#cd7c3b']
const podiumEmoji = ['🥇', '🥈', '🥉']

// Night window: 6 PM (18) through 6 AM next day
function isNightSession(startedAt) {
  if (!startedAt) return false
  const d = new Date(startedAt)
  const hour = d.getHours()
  return hour >= 18 || hour < 6
}

function bestNightDrinks(sessions) {
  const nightSessions = sessions.filter((s) => isNightSession(s.started_at))
  if (nightSessions.length === 0) return 0
  return Math.max(...nightSessions.map((s) => s.total_standard_drinks || 0))
}

function PodiumCard({ rank, entry, isYou }) {
  const color = podiumColors[rank - 1]
  return (
    <div
      className="flex-1 rounded-2xl border text-center overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: isYou ? color : 'var(--border)',
        boxShadow: isYou ? `0 0 0 1.5px ${color}` : 'none',
      }}
    >
      <div className="py-3" style={{ background: `${color}18` }}>
        <span className="text-2xl">{podiumEmoji[rank - 1]}</span>
      </div>
      <div className="px-3 py-3">
        <p className="font-black text-sm truncate" style={{ color: 'var(--text)' }}>
          {entry.display_name}{isYou ? ' (you)' : ''}
        </p>
        <p className="font-black text-xl mt-1" style={{ color }}>{entry.drinks}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>drinks</p>
      </div>
    </div>
  )
}

function RankRow({ rank, entry, isYou }) {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border"
      style={{
        backgroundColor: isYou ? 'rgba(245,200,66,0.06)' : 'var(--bg-card)',
        borderColor: isYou ? 'rgba(245,200,66,0.3)' : 'var(--border)',
      }}
    >
      <span className="w-7 text-center font-black text-sm shrink-0" style={{ color: 'var(--text-muted)' }}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate" style={{ color: isYou ? '#f5c842' : 'var(--text)' }}>
          {entry.display_name}{isYou ? ' · You' : ''}
        </p>
      </div>
      <div className="shrink-0 flex items-center gap-1">
        <Wine size={13} style={{ color: isYou ? '#f5c842' : 'var(--text-muted)' }} />
        <span className="font-black text-base" style={{ color: isYou ? '#f5c842' : 'var(--text)' }}>
          {entry.drinks}
        </span>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const { user, profile, updateProfile } = useAuth()
  const [tab, setTab] = useState('university')
  const [entries, setEntries] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [loadingBoard, setLoadingBoard] = useState(false)
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [showInfo, setShowInfo] = useState(false)

  // Load groups once on mount (independent of tab)
  useEffect(() => {
    async function fetchGroups() {
      setLoadingGroups(true)
      const { data, error } = await supabase
        .from('friend_group_members')
        .select('group_id, friend_groups!inner(id, name)')
        .eq('user_id', user.id)
      if (!error) {
        const gs = data?.map((d) => d.friend_groups) || []
        setGroups(gs)
        // Auto-select the first group if we have one and no selection yet
        if (gs.length > 0 && !selectedGroup) {
          setSelectedGroup(gs[0].id)
        }
      }
      setLoadingGroups(false)
    }
    fetchGroups()
  }, [user.id])

  // Reload leaderboard whenever tab, selectedGroup, or profile changes
  const loadLeaderboard = useCallback(async () => {
    setLoadingBoard(true)
    setEntries([])

    if (tab === 'university') {
      if (!profile?.university_name) { setLoadingBoard(false); return }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, show_on_leaderboard')
        .eq('university_name', profile.university_name)
        .eq('show_on_leaderboard', true)

      if (profiles?.length) {
        const userIds = profiles.map((p) => p.id)
        const byUser = await fetchSessionsByUsers(userIds)
        setEntries(
          profiles
            .map((p) => ({ ...p, drinks: parseFloat(bestNightDrinks(byUser[p.id] || []).toFixed(1)) }))
            .sort((a, b) => b.drinks - a.drinks)
        )
      }

    } else if (tab === 'group') {
      if (!selectedGroup) { setLoadingBoard(false); return }

      const { data: members } = await supabase
        .from('friend_group_members')
        .select('user_id, profiles:profiles!friend_group_members_user_id_fkey(id, display_name)')
        .eq('group_id', selectedGroup)

      if (members?.length) {
        const userIds = members.map((m) => m.user_id)
        const byUser = await fetchSessionsByUsers(userIds)
        setEntries(
          members
            .map((m) => ({
              id: m.user_id,
              display_name: m.profiles?.display_name || 'Unknown',
              drinks: parseFloat(bestNightDrinks(byUser[m.user_id] || []).toFixed(1)),
            }))
            .sort((a, b) => b.drinks - a.drinks)
        )
      }
    }

    setLoadingBoard(false)
  }, [tab, selectedGroup, profile])

  useEffect(() => { loadLeaderboard() }, [loadLeaderboard])

  async function fetchSessionsByUsers(userIds) {
    if (!userIds.length) return {}
    const { data: sessions } = await supabase
      .from('drink_sessions')
      .select('user_id, started_at, total_standard_drinks')
      .in('user_id', userIds)
      .eq('status', 'completed')
    const byUser = {}
    for (const s of sessions || []) {
      if (!byUser[s.user_id]) byUser[s.user_id] = []
      byUser[s.user_id].push(s)
    }
    return byUser
  }

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const isLoading = loadingBoard || (tab === 'group' && loadingGroups)

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,200,66,0.15)' }}>
              <Trophy size={20} style={{ color: '#f5c842' }} />
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Leaderboard</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Best single night · 6 PM – 6 AM</p>
            </div>
          </div>
          <button
            onClick={() => setShowInfo((v) => !v)}
            className="p-2 rounded-xl"
            style={{ color: showInfo ? '#f5c842' : 'var(--text-muted)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Info size={16} />
          </button>
        </div>

        {/* Info panel */}
        {showInfo && (
          <div
            className="rounded-2xl p-4 mb-5 text-xs leading-relaxed space-y-1.5"
            style={{ backgroundColor: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.25)', color: 'var(--text-muted)' }}
          >
            <p>🏆 <strong style={{ color: 'var(--text)' }}>Ranking:</strong> highest single-night drink total across all your past nights (6 PM–6 AM window).</p>
            <p>🎓 <strong style={{ color: 'var(--text)' }}>University:</strong> anyone at your school who opted in.</p>
            <p>👥 <strong style={{ color: 'var(--text)' }}>Group:</strong> only people in the selected group — private and invite-only.</p>
          </div>
        )}

        {/* Tabs */}
        <div
          className="flex gap-1 mb-5 rounded-2xl p-1"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {[
            { id: 'university', label: '🎓 University', icon: GraduationCap },
            { id: 'group', label: '👥 Group', icon: Users },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={
                tab === id
                  ? { background: 'linear-gradient(135deg, #f5c842, #f0a020)', color: '#0a0c14' }
                  : { color: 'var(--text-muted)' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* University tab controls */}
        {tab === 'university' && (
          <div
            className="flex items-center justify-between mb-5 px-4 py-3.5 rounded-2xl border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Show my name</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Appear in your university's public ranking
              </p>
            </div>
            <button
              onClick={() => updateProfile({ show_on_leaderboard: !profile?.show_on_leaderboard })}
              className="w-12 h-6 rounded-full relative shrink-0 ml-4"
              style={{ backgroundColor: profile?.show_on_leaderboard ? '#f5c842' : 'var(--border)', transition: 'background 0.2s' }}
            >
              <div
                className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
                style={{ transform: profile?.show_on_leaderboard ? 'translateX(24px)' : 'translateX(2px)', transition: 'transform 0.2s ease' }}
              />
            </button>
          </div>
        )}

        {/* Group tab controls */}
        {tab === 'group' && (
          <div className="mb-5 space-y-3">
            {/* Privacy note */}
            <div
              className="px-4 py-3 rounded-2xl border flex items-start gap-2.5"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <Users size={14} style={{ color: '#8b5cf6', marginTop: 2, flexShrink: 0 }} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Group leaderboards are <strong style={{ color: 'var(--text)' }}>private</strong> — only members of the group can see this ranking. Your "Show my name" setting doesn't apply here.
              </p>
            </div>

            {/* Group picker */}
            {loadingGroups ? (
              <div className="flex items-center justify-center py-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent" style={{ borderColor: '#f5c842', borderTopColor: 'transparent' }} />
              </div>
            ) : groups.length === 0 ? (
              <div
                className="px-4 py-3.5 rounded-2xl border text-sm text-center"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                You're not in any groups yet. Create or join one in <strong style={{ color: 'var(--text)' }}>Social → Groups</strong>.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroup(g.id)}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl border text-left"
                    style={{
                      backgroundColor: selectedGroup === g.id ? 'rgba(139,92,246,0.1)' : 'var(--bg-card)',
                      borderColor: selectedGroup === g.id ? '#8b5cf6' : 'var(--border)',
                      boxShadow: selectedGroup === g.id ? '0 0 0 1px #8b5cf6' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: selectedGroup === g.id ? 'rgba(139,92,246,0.2)' : 'var(--bg-input)' }}
                      >
                        <Users size={14} style={{ color: selectedGroup === g.id ? '#8b5cf6' : 'var(--text-muted)' }} />
                      </div>
                      <span className="font-semibold text-sm" style={{ color: selectedGroup === g.id ? '#8b5cf6' : 'var(--text)' }}>
                        {g.name}
                      </span>
                    </div>
                    {selectedGroup === g.id && (
                      <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: '#f5c842', borderTopColor: 'transparent' }} />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
            {tab === 'university' && !profile?.university_name
              ? '🎓 Set your university in Profile to see rankings.'
              : tab === 'group' && !selectedGroup
              ? '👥 Select a group above to see rankings.'
              : '🏁 No night sessions yet — be the first!'}
          </div>
        ) : (
          <>
            {top3.length > 0 && (
              <div className="flex gap-2 mb-5 items-end">
                {[
                  top3[1] && { entry: top3[1], rank: 2 },
                  top3[0] && { entry: top3[0], rank: 1 },
                  top3[2] && { entry: top3[2], rank: 3 },
                ].filter(Boolean).map(({ entry, rank }) => (
                  <PodiumCard key={entry.id} rank={rank} entry={entry} isYou={entry.id === user.id} />
                ))}
              </div>
            )}
            {rest.length > 0 && (
              <div className="space-y-2">
                {rest.map((entry, i) => (
                  <RankRow key={entry.id} rank={i + 4} entry={entry} isYou={entry.id === user.id} />
                ))}
              </div>
            )}
          </>
        )}

        <p className="text-xs text-center mt-6 pb-2" style={{ color: 'var(--text-muted)' }}>
          🍺 Best single night · 6 PM – 6 AM · Drink responsibly
        </p>
      </div>
    </div>
  )
}
