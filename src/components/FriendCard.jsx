import { Eye, EyeOff, Wine } from 'lucide-react'

export default function FriendCard({ friend, canSeeDrinks, onToggleVisibility }) {
  const initials = (friend.display_name || '??')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Show tonight's drink count if it's after 6 PM, visibility is on, and we have the data
  const hour = new Date().getHours()
  const isNightTime = hour >= 18 || hour < 6
  const showDrinks = canSeeDrinks && isNightTime && friend.tonight_drinks != null

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between p-3">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
            style={{ background: 'rgba(245,200,66,0.15)', color: '#f5c842' }}
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
              {friend.display_name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {friend.has_active_session && (
                <span className="text-xs font-medium" style={{ color: '#10b981' }}>● Out tonight</span>
              )}
              {showDrinks && (
                <span
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,200,66,0.12)', color: '#f5c842' }}
                >
                  <Wine size={10} />
                  {friend.tonight_drinks} drink{friend.tonight_drinks !== 1 ? 's' : ''} tonight
                </span>
              )}
              {canSeeDrinks && isNightTime && !friend.has_active_session && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No active session</span>
              )}
            </div>
          </div>
        </div>

        {/* Visibility toggle */}
        {onToggleVisibility && (
          <button
            onClick={() => onToggleVisibility(friend.id)}
            className="p-2 rounded-lg flex-shrink-0"
            style={{ color: canSeeDrinks ? '#f5c842' : 'var(--text-muted)' }}
            title={canSeeDrinks ? 'Tap to hide your drinks from them' : 'Tap to share your drinks with them'}
          >
            {canSeeDrinks ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
      </div>

      {/* Visibility explanation strip */}
      {onToggleVisibility && (
        <div
          className="px-3 py-2 border-t flex items-center gap-2"
          style={{ borderColor: 'var(--border)', backgroundColor: canSeeDrinks ? 'rgba(245,200,66,0.05)' : 'transparent' }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: canSeeDrinks ? '#f5c842' : 'var(--text-muted)', opacity: canSeeDrinks ? 1 : 0.4 }}
          />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {canSeeDrinks
              ? <span>They <strong style={{ color: 'var(--text)' }}>can see</strong> your drink count &amp; BAC when you're active</span>
              : <span>Your drinks are <strong style={{ color: 'var(--text)' }}>hidden</strong> from them — tap the eye icon to share</span>
            }
          </p>
        </div>
      )}
    </div>
  )
}
