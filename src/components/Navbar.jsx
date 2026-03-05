import { NavLink } from 'react-router-dom'
import { Home, Wine, Users, Trophy, User } from 'lucide-react'

const links = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/track', icon: Wine, label: 'Track' },
  { to: '/social', icon: Users, label: 'Social' },
  { to: '/leaderboard', icon: Trophy, label: 'Board' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Navbar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4 pointer-events-none">
      <nav
        className="glass-nav pointer-events-auto flex justify-around items-center h-16 rounded-2xl shadow-2xl"
        style={{ width: '100%', maxWidth: '420px' }}
      >
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl"
          >
            {({ isActive }) => (
              <>
                <div
                  style={{
                    color: isActive ? '#f5c842' : 'var(--text-muted)',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: isActive ? '#f5c842' : 'var(--text-muted)',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
