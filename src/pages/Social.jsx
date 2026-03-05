import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import FriendCard from '../components/FriendCard'
import { UserPlus, Users, Bell, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Social() {
  const { user } = useAuth()
  const [tab, setTab] = useState('friends')
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [alerts, setAlerts] = useState([])
  const [groups, setGroups] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [newGroupName, setNewGroupName] = useState('')

  useEffect(() => {
    loadData()
    const channel = supabase
      .channel('friend-alerts')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'friend_alerts',
        filter: `friend_id=eq.${user.id}`,
      }, (payload) => {
        toast(payload.new.message, { icon: '⚠️', duration: 5000 })
        setAlerts((prev) => [payload.new, ...prev])
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user])

  async function loadData() {
    setLoading(true)
    const [friendsRes, requestsRes, alertsRes, groupsRes] = await Promise.all([
      supabase.from('friendships')
        .select('*, requester:profiles!friendships_requester_id_fkey(*), addressee:profiles!friendships_addressee_id_fkey(*)')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted'),
      supabase.from('friendships')
        .select('*, requester:profiles!friendships_requester_id_fkey(*)')
        .eq('addressee_id', user.id).eq('status', 'pending'),
      supabase.from('friend_alerts').select('*').eq('friend_id', user.id)
        .order('created_at', { ascending: false }).limit(20),
      supabase.from('friend_groups').select('*, friend_group_members(user_id)').eq('creator_id', user.id),
    ])

    const friendList = (friendsRes.data || []).map((f) => {
      const friendProfile = f.requester_id === user.id ? f.addressee : f.requester
      return { ...friendProfile, friendship_id: f.id, can_see_drinks: f.can_see_drinks }
    })

    setFriends(friendList)
    setRequests(requestsRes.data || [])
    setAlerts(alertsRes.data || [])
    setGroups(groupsRes.data || [])
    setLoading(false)
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return
    const { data } = await supabase.from('profiles').select('id, display_name')
      .ilike('display_name', `%${searchQuery}%`).neq('id', user.id).limit(10)
    setSearchResults(data || [])
  }

  async function sendFriendRequest(addresseeId) {
    const { error } = await supabase.from('friendships').insert({ requester_id: user.id, addressee_id: addresseeId })
    if (error) {
      toast.error(error.message.includes('duplicate') ? 'Request already sent' : 'Failed to send request')
    } else {
      toast.success('Friend request sent!')
      setSearchResults([])
      setSearchQuery('')
    }
  }

  async function acceptRequest(friendshipId) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    toast.success('Friend request accepted!')
    loadData()
  }

  async function toggleVisibility(friendId) {
    const friend = friends.find((f) => f.id === friendId)
    if (!friend) return
    await supabase.from('friendships').update({ can_see_drinks: !friend.can_see_drinks }).eq('id', friend.friendship_id)
    setFriends((prev) => prev.map((f) => f.id === friendId ? { ...f, can_see_drinks: !f.can_see_drinks } : f))
  }

  async function createGroup() {
    if (!newGroupName.trim()) return
    const { error } = await supabase.from('friend_groups').insert({ creator_id: user.id, name: newGroupName })
    if (error) toast.error('Failed to create group')
    else { toast.success('Group created!'); setNewGroupName(''); loadData() }
  }

  const tabs = [
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'requests', label: 'Requests', icon: UserPlus, badge: requests.length },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alerts.filter((a) => !a.is_read).length },
  ]

  const inputStyle = {
    flex: 1,
    padding: '0.6rem 0.875rem',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    color: 'var(--text)',
    outline: 'none',
    fontSize: '0.875rem',
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>Social</h1>

      {/* Tabs */}
      <div
        className="flex gap-1 mb-6 rounded-2xl p-1"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {tabs.map(({ id, label, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-colors relative ${
              tab === id ? 'bg-buzz-primary text-gray-950' : ''
            }`}
            style={tab !== id ? { color: 'var(--text-muted)' } : {}}
          >
            {label}
            {badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-buzz-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <>
          {/* Friends Tab */}
          {tab === 'friends' && (
            <div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name..."
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                <button onClick={handleSearch} className="px-3 py-2 bg-buzz-primary text-gray-950 rounded-xl font-bold">
                  <Search size={16} />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Results</p>
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-3 rounded-xl border"
                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                    >
                      <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{result.display_name}</span>
                      <button onClick={() => sendFriendRequest(result.id)}
                        className="text-xs px-3 py-1.5 bg-buzz-primary text-gray-950 rounded-lg font-bold">
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {friends.length === 0 ? (
                  <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>
                    No friends yet. Search for people to add!
                  </p>
                ) : (
                  friends.map((friend) => (
                    <FriendCard key={friend.id} friend={friend} canSeeDrinks={friend.can_see_drinks} onToggleVisibility={toggleVisibility} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {tab === 'requests' && (
            <div className="space-y-2">
              {requests.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>No pending requests</p>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-xl border"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{req.requester?.display_name}</span>
                    <button onClick={() => acceptRequest(req.id)}
                      className="text-xs px-3 py-1.5 bg-buzz-safe text-white rounded-lg font-bold">
                      Accept
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Groups Tab */}
          {tab === 'groups' && (
            <div>
              <div className="flex gap-2 mb-4">
                <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="New group name..."
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
                <button onClick={createGroup} className="px-4 py-2 bg-buzz-primary text-gray-950 rounded-xl text-sm font-bold">
                  Create
                </button>
              </div>
              <div className="space-y-2">
                {groups.length === 0 ? (
                  <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>No groups yet</p>
                ) : (
                  groups.map((group) => (
                    <div key={group.id} className="p-3 rounded-xl border"
                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{group.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {group.friend_group_members?.length || 0} members
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {tab === 'alerts' && (
            <div className="space-y-2">
              {alerts.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>No alerts yet</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id}
                    className={`p-3 rounded-xl border ${alert.is_read ? '' : 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800'}`}
                    style={alert.is_read ? { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' } : {}}>
                    <p className="text-sm font-medium" style={alert.is_read ? { color: 'var(--text)' } : { color: '#991b1b' }}>{alert.message}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
