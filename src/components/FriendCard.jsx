import { Eye, EyeOff } from 'lucide-react'

export default function FriendCard({ friend, canSeeDrinks, onToggleVisibility }) {
  const initials = (friend.display_name || '??')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl border"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-buzz-primary/15 flex items-center justify-center text-buzz-primary font-bold text-sm">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            {friend.display_name}
          </p>
          {friend.has_active_session && (
            <p className="text-xs text-buzz-safe font-medium">● Active session</p>
          )}
        </div>
      </div>
      {onToggleVisibility && (
        <button
          onClick={() => onToggleVisibility(friend.id)}
          className="p-2 rounded-lg transition-colors hover:bg-buzz-primary/10"
          style={{ color: 'var(--text-muted)' }}
          title={canSeeDrinks ? 'They can see your drinks' : 'Hidden from them'}
        >
          {canSeeDrinks ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      )}
    </div>
  )
}
