import { NavLink } from 'react-router-dom'
import { Home, Wine, Users, Trophy, User } from 'lucide-react'

const links = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/track', icon: Wine, label: 'Track' },
  { to: '/social', icon: Users, label: 'Social' },
  { to: '/leaderboard', icon: Trophy, label: 'Board' },
  { to: '/profile', icon: User, label: 'Me' },
]

export default function Navbar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-5 px-4 pointer-events-none">
      <nav
        className="glass-nav pointer-events-auto flex justify-around items-center h-[58px] rounded-2xl"
        style={{ width: '100%', maxWidth: '400px' }}
      >
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="relative flex flex-col items-center justify-center gap-[3px] px-4 py-2 rounded-xl group"
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  style={{ color: isActive ? '#f59e0b' : 'var(--text-muted)' }}
                />
                <span
                  className="text-[10px] font-semibold tracking-tight"
                  style={{ color: isActive ? '#f59e0b' : 'var(--text-muted)' }}
                >
                  {label}
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: '#f59e0b' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
